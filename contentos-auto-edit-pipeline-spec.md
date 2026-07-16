# ContentOS — Automated Edit Pipeline

**Feature spec: raw upload → finished, graded short/long-form video**

Status: Draft v1
Author: (you)
Scope: Architecture + data model + job orchestration. No UI visual design, no infra provisioning details (cloud/on-prem left open).

---

## 1. Goal

A user uploads one raw clip. They pick one or more target formats (explainer / TikTok-raw / long-form YouTube). The system runs the full 7-step pipeline — intake, rough cut, graphics, second-pass review, captions, background music, export — without further input, using the existing skill set (WhisperX rough-cut, HyperFrames graphics engine, locked style presets) and produces `outputs/<job>/<format>/final.mp4` ready to ship.

The user can intervene at any stage — pause the job, inspect/edit the current state, resume — but nothing requires them to. Default is fully autonomous.

This document specs the system that makes that true.

---

## 2. Design principles

1. **Same 7 steps for every job.** Only steps 3 (Graphics) and 5 (Captions) branch by format. Everything else is shared, deterministic infrastructure — don't let format logic leak into steps 1, 2, 4, 6, 7.
2. **Auto by default, editable by exception.** Every step writes its output to durable storage before advancing. The job never needs the user, but every step is a valid pause/resume boundary.
3. **Skills and presets are versioned and locked.** The pipeline calls into the existing skill set (`rough-cut`, `graphics-plan`, `embedded-captions`, `background-music`, `thumbnail-generator`, `to-premiere`, `finalize.sh`, `prune.sh`) and the HyperFrames engine as black boxes. The orchestrator never hand-edits their internals — upgrades flow through `skills-lock.json`, same as today.
4. **One job, many formats.** A single upload can fan out into N parallel format-specific renders after step 2, each running steps 3–7 independently, re-converging only at delivery.
5. **Idempotent steps.** Every step is re-runnable from its own input without re-running prior steps. This is what makes pause/edit/resume safe.

---

## 3. High-level architecture

```
                              ┌──────────────────────┐
   User uploads raw clip ───▶│   Intake API / UI     │
                              └──────────┬────────────┘
                                         │ creates Job (+ N FormatRuns)
                                         ▼
                              ┌──────────────────────┐
                              │   Job Orchestrator    │◀────────────┐
                              │  (state machine +     │             │
                              │   durable job queue)  │             │
                              └──────────┬────────────┘             │
                                         │ dispatches StepTasks      │
                                         ▼                          │
        ┌──────────────────────────────────────────────────┐       │
        │                  Worker Pool                       │       │
        │  ┌───────────┐ ┌───────────┐ ┌──────────────────┐ │       │
        │  │ rough-cut │ │ graphics  │ │ captions / music  │ │       │
        │  │ (WhisperX)│ │ (HyperFr.)│ │ (HyperFrames/ffmpeg)│      │
        │  └───────────┘ └───────────┘ └──────────────────┘ │       │
        └──────────────────────────────────────────────────┘       │
                                         │ writes StepArtifact        │
                                         ▼                          │
                              ┌──────────────────────┐             │
                              │  Artifact Store        │             │
                              │  projects/<job>/...    │             │
                              │  outputs/<job>/...     │             │
                              └──────────┬────────────┘             │
                                         │                          │
                                         ▼                          │
                              ┌──────────────────────┐             │
                              │  Review / Intervention │─────────────┘
                              │  API (pause, edit,     │
                              │  resume, approve)      │
                              └──────────────────────┘
```

Four subsystems: **Job Orchestrator** (state machine driving step sequencing and fan-out), **Worker Pool** (stateless executors wrapping each skill/preset), **Artifact Store** (durable, versioned storage of every intermediate output), and **Review/Intervention API** (the human-in-the-loop surface, optional at every step).

---

## 4. Data model

### 4.1 Job

One Job per uploaded raw clip.

| Field | Type | Notes |
|---|---|---|
| `job_id` | UUID | |
| `raw_clip_uri` | string | original upload location, immutable |
| `status` | enum | `intake`, `rough_cutting`, `awaiting_formats`, `running`, `paused`, `completed`, `failed` |
| `created_at` / `updated_at` | timestamp | |
| `format_runs` | FormatRun[] | one per requested output format |
| `shared_artifacts` | StepArtifact[] | outputs of steps 1, 2, 4 (pre-fan-out) |

### 4.2 FormatRun

One per requested format (explainer / tiktok-raw / long-form-youtube). Runs independently from step 3 onward.

| Field | Type | Notes |
|---|---|---|
| `format_run_id` | UUID | |
| `job_id` | UUID | parent |
| `format` | enum | `short_explainer`, `short_tiktok_raw`, `long_form_youtube` |
| `current_step` | int | 1–7 |
| `status` | enum | `pending`, `running`, `paused`, `awaiting_review`, `completed`, `failed` |
| `step_artifacts` | StepArtifact[] | per-step outputs for this format |
| `final_output_uri` | string \| null | set on step 7 completion |

### 4.3 StepArtifact

Every step — shared or format-specific — produces exactly one of these. This is the unit the Review API reads/edits and the unit a pause/resume boundary attaches to.

| Field | Type | Notes |
|---|---|---|
| `step_number` | int | 1–7 |
| `step_name` | string | `intake`, `rough_cut`, `graphics`, `second_pass`, `captions`, `background_music`, `export` |
| `skill_used` | string | e.g. `rough-cut`, `graphics-plan`, `embedded-captions` |
| `preset_used` | string \| null | e.g. `signature-style`, `liquid-glass-style`, `tiktok-raw-style`, `captions-style` |
| `input_uri` | string | what this step consumed |
| `output_uri` | string | what this step produced |
| `metadata` | JSON | step-specific (e.g. transcript, beat map, caption timing, EQ/ducking params) |
| `status` | enum | `queued`, `running`, `succeeded`, `failed`, `superseded` |
| `editable` | bool | true for every step — see §7 |
| `human_edited` | bool | true if a user modified this artifact post-generation |
| `started_at` / `completed_at` | timestamp | |

### 4.4 Skill/Preset Registry references

The orchestrator does not embed skill logic. Every StepArtifact records which skill version and preset version ran, sourced from `skills-lock.json`, so any output is reproducible and any future skill upgrade can be diffed against historical runs.

---

## 5. The pipeline, step by step

Shared steps (1, 2, 4, 6, 7) run once per Job. Format-specific steps (3, 5) run once per FormatRun. Step 6 (background music) is optional and skippable per FormatRun.

| # | Step | Scope | Skill | Output | Notes |
|---|---|---|---|---|---|
| 1 | **Intake** | shared | — | `projects/<job>/raw/` | Copy raw upload, run validation (codec, duration, resolution, corrupt-frame check) before anything else touches it. |
| 2 | **Rough cut** | shared | `rough-cut` (WhisperX) | `projects/<job>/rough-cut/` + transcript + script | ASR transcription, filler-word removal, audio polish. Produces the script used by step 3's graphics planner. Off-ramp: can export a Premiere Pro project here if a human wants to take over entirely (dashed path in original diagram) — implemented as an alternate terminal state, not a pipeline step. |
| 3 | **Graphics** | per-format | `graphics-plan` → HyperFrames | `projects/<job>/<format>/graphics/` | Format determines preset (`signature-style` + format-specific layout: top-half cards / hook-card-to-raw / glass+zoom). Plans beats off the step-2 script, then renders via HyperFrames. |
| 4 | **Second pass** | shared* | — (manual or auto-QA) | incremental re-composite | *In the original workflow this is a human review gate. In contentOs default-auto mode this becomes an **automated QA pass** (see §6) that re-composites only if QA flags an issue — human review remains available as an intervention, not a requirement. |
| 5 | **Captions** | per-format, short-form only | `embedded-captions` | `projects/<job>/<format>/captions/` | Skipped entirely for long-form YouTube (relies on native YT CC). Burn-in on-beat for short-form, using `captions-style` + `caption-corrections.json` for brand/spelling fixes. |
| 6 | **Background music** | per-format, optional | `background-music` | `projects/<job>/<format>/audio/` | Sidechain duck against dialogue, re-normalize. Skippable per FormatRun via a flag set at job creation or toggled mid-run. |
| 7 | **Export** | per-format | `to-premiere` (off-ramp) / `finalize.sh` + `prune.sh` | `outputs/<job>/<format>/final.mp4` | Finalize render, prune intermediate files per retention policy, promote to outputs. Triggers thumbnail generation (`thumbnail-generator`) for formats that need one (skip for tiktok-raw per the format variant table). |

### 5.1 Format variant table (drives steps 3 & 5 only)

| | short-explainer | short-tiktok-raw | long-form-youtube |
|---|---|---|---|
| Aspect | 9:16, 1080×1920 | 9:16, 1080×1920 | 16:9, 1920×1080 |
| Graphics | top-half cards | hook card → raw | glass + zoom |
| Captions | centered, locked | low, under face | none (YT native CC) |
| Thumbnail | usually skip | skip | always |

This table is config, not code — it should live as data (e.g. `format-variants.json`) consumed by steps 3, 5, and 7, so adding a 4th format later is a config change, not an orchestrator change.

---

## 6. Automated QA — replacing the manual review gate

The original pipeline's step 4 is a named human ("Jason reviews"). For contentOs to run hands-off by default, step 4 becomes an **automated QA pass** with defined, narrow checks — it is not a creative judgment AI, it's a correctness gate:

- Caption/audio sync drift beyond threshold
- Silence/dead-air gaps beyond threshold post-filler-removal
- Graphics overlay collision or off-canvas placement (HyperFrames render bounds check)
- Loudness normalization out of target range (e.g. outside −14 LUFS ±1 for short-form platforms)
- Frame drops / encode artifacts in the rough-cut output

If QA passes, the FormatRun proceeds automatically. If QA fails, the FormatRun moves to `awaiting_review` and the StepArtifact is flagged — this is the one place where the system can auto-pause itself, distinct from a user-initiated pause. Everything else stays fully automatic by design; this is a deliberate, narrow exception, not a general "AI reviews creative quality" claim.

---

## 7. Intervention model — pause / edit / resume

This is the architectural answer to "user can intervene at any step."

### 7.1 Mechanism

- The Job Orchestrator is a durable state machine (e.g. backed by a workflow engine — Temporal, or a simpler Postgres-backed job queue with explicit step boundaries). Every step transition is a discrete, persisted state change, not an in-memory pipeline.
- **Pause**: at any point, the user can call `PAUSE(format_run_id)`. If a step is mid-execution, it's allowed to finish (steps are not interrupted mid-render — that risks a corrupt artifact); the run halts before starting the next step. Status → `paused`.
- **Edit**: while paused, the user can fetch any `StepArtifact` (current or historical) via the Review API and submit a replacement (e.g. re-time a caption, swap a graphics preset, manually trim the rough cut, replace the transcript). The edited artifact is marked `human_edited: true` and `superseded` is set on the original. This is intentionally an artifact-replacement model, not live-patch — it keeps every state reproducible and auditable.
- **Resume**: `RESUME(format_run_id)` re-validates the (possibly edited) current StepArtifact and re-enters the orchestrator at `current_step + 1`. If the user edited a step earlier than `current_step` (e.g. re-did the rough cut after graphics already ran), the orchestrator invalidates and re-queues every downstream step for that FormatRun — this is what idempotent steps (§2.5) are for.
- **Approve gates** (optional, opt-in per job): a user can configure specific steps as hard approval gates (e.g. "always pause after step 3 graphics for my review") rather than relying on ad hoc pausing. This is config on the Job, not a different code path.

### 7.2 Why pause/resume over the alternatives

Two other models were considered and rejected for v1:
- **Live preview + hot-swap while running**: requires steps to be streaming/interruptible mid-execution, which conflicts with skills like HyperFrames rendering being treated as atomic black boxes. Higher complexity, no clear v1 benefit.
- **Approval-gate-only (like the original step 4)**: too rigid — forces a fixed human checkpoint even for fully-trusted automated jobs. Pause/resume is a superset: gates become a configuration of pause/resume, not a separate mechanism.

---

## 8. Worker pool & skill invocation contract

Every step's worker conforms to the same contract, so adding a new skill or upgrading an existing one doesn't touch the orchestrator:

```
StepWorker.run(input: StepArtifact[], preset: string, config: JSON) -> StepArtifact
```

- Pure function of its declared inputs — no hidden state, no reaching into other steps' artifacts directly.
- Failure is a first-class output (`status: failed` with structured error), not an exception that kills the job. The orchestrator decides retry/pause/fail policy centrally.
- Workers pull skill/preset versions from `skills-lock.json` at invocation time and record exactly which version ran on the StepArtifact — this is what makes a job reproducible months later even after presets are updated upstream.

---

## 9. Storage layout

```
projects/<job_id>/
  raw/                          # step 1 output (shared)
  rough-cut/                    # step 2 output (shared), incl. transcript.json, script.json
  <format>/
    graphics/                   # step 3 output
    second-pass/                # step 4 output (QA report + recomposite if needed)
    captions/                   # step 5 output (short-form only)
    audio/                      # step 6 output (optional)

outputs/<job_id>/
  <format>/
    final.mp4
    thumbnail.jpg               # where applicable per format-variants.json
```

Retention: `prune.sh` (step 7) removes intermediate artifacts per a configurable retention policy (e.g. keep last N versions of any superseded artifact, or keep everything for jobs flagged for audit).

---

## 10. Motion graphics & visual quality

Per your existing setup, this is intentionally not reinvented:

- All graphics rendering routes through the **HyperFrames toolkit** (vendored, HTML-based video engine) — reframe, graphics, b-roll, motion, captions.
- Visual style is governed entirely by **locked presets**: `signature-style`, `captions-style`, `tiktok-raw-style`, `liquid-glass-style`, plus the `caption-corrections.json` overlay for brand/spelling fixes.
- The orchestrator never generates or hand-tunes motion graphics itself — it selects which preset applies per the format-variant table (§5.1) and passes through to HyperFrames. Quality and "today's style" is a property of the preset library, updated independently via `skills-lock.json`, not something this pipeline spec owns.
- Practical implication: keeping output looking current is a preset-maintenance workflow (updating `signature-style`/`liquid-glass-style` etc. periodically), separate from this orchestration layer. Worth scheduling as ongoing design work, not a one-time build.

---

## 11. Failure handling

| Failure type | Behavior |
|---|---|
| Worker crash / transient error | Orchestrator retries with backoff (configurable max attempts per step type) |
| Skill-level failure (e.g. WhisperX can't transcribe corrupted audio) | StepArtifact → `failed`, FormatRun → `failed`, Job continues for other FormatRuns unaffected |
| QA gate failure (§6) | FormatRun → `awaiting_review`, not `failed` — recoverable by definition |
| Storage/artifact write failure | Step is not considered complete; orchestrator does not advance; safe to retry (idempotent steps) |

A single FormatRun failing never blocks sibling FormatRuns in the same Job — they're independent after step 2.

---

## 12. Open questions for next iteration

- Workflow engine choice (Temporal vs. custom Postgres-backed queue) — affects pause/resume implementation detail, not this spec's contract.
- SLA/latency targets per step (esp. WhisperX transcription and HyperFrames render times) — needed to size the worker pool.
- Multi-tenant concurrency limits (how many simultaneous FormatRuns per user/org).
- Whether QA thresholds (§6) are global defaults or per-user configurable.
- Cost attribution per Job/FormatRun if this is metered/billed.

---

## 13. Summary

One Job per upload, fanning out into independent FormatRuns after the shared rough-cut. Every step writes a durable, versioned StepArtifact through a uniform worker contract wrapping your existing skills/presets. The orchestrator is a persisted state machine, which is what makes "auto by default, editable at any step" actually true architecturally — pause, edit, and resume are state transitions on the same artifacts the automated pipeline itself produces, not a separate system bolted on top.
