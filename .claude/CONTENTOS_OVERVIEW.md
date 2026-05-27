<![endif]-->

**ContentOS AI**

The All-in-One AI Content Operating System

Product Requirements Document  |  v1.0  |  May 2026

**Prepared by**

Prem | Growthax

**Status**

Draft — Internal

**Version**

1.0

**Date**

May 2026

  

# 1. Executive Summary

ContentOS AI is a comprehensive, AI-powered content operating system designed for creators, agencies, and personal brands who want to build authority, grow audiences, and monetize content — all from a single platform. Built on top of Claude AI and integrated with best-in-class tools, ContentOS handles the full content lifecycle: from idea generation to scripting, video editing, carousel design, competitor analysis, thumbnail creation, page setup, and growth strategy.

This PRD defines the product vision, user personas, feature scope, module architecture, technical requirements, success metrics, and roadmap for the ContentOS AI platform.

**Problem**

Content creators waste 60-80% of their time on operational tasks — researching, scripting, designing, editing — instead of creating. There is no unified platform that uses AI to handle the entire content workflow end-to-end.

**Solution**

ContentOS AI brings together 8 core AI-powered modules under one roof, automating the most time-consuming parts of content creation while giving creators full creative control and strategic direction.

  

# 2. Product Vision & Goals

## 2.1 Vision Statement

"Become the operating system for serious content creators — the platform where ideas become viral content, with AI doing the heavy lifting."

## 2.2 Strategic Goals

**Goal**

**Description**

**Target**

Creator Efficiency

Reduce time spent on content ops by 70%

< 6 months post-launch

AI-First Workflows

80%+ of tasks auto-completed by AI

MVP release

Platform Stickiness

7-day active usage rate above 60%

3 months post-launch

Revenue Generation

500 paying users within 90 days

Q3 2026

Brand Authority

Position ContentOS as the go-to tool for AI content

6 months

## 2.3 Target Users

**Persona**

**Description**

**Platform Focus**

Solo Creator

YouTuber, Reels creator, or podcaster growing a personal brand

YouTube, Instagram

Content Agency

Team managing 5-20 client accounts

Multi-platform

AI Automation Agencies

Agencies offering AI-powered content as a service

B2B clients

Business Owner

Entrepreneur building personal brand + brand content

LinkedIn, Instagram

Course Creator / Coach

Building authority via content to sell courses

Instagram, YouTube

  

# 3. Core Modules & Feature Specification

ContentOS AI is organized into 8 core modules, each powered by Claude AI with specialized system prompts, integrations, and skill sets.

**MODULE 1 — Script Writing Engine**

**Overview**

An AI script writer that produces platform-optimized, audience-aligned video scripts from a single prompt or brief. Supports long-form YouTube, short-form Reels/Shorts, podcast outlines, and LinkedIn videos.

**Key Features**

<![if !supportLists]>• <![endif]>Hook generator — 5 high-impact opening hooks per script using proven frameworks (PAS, AIDA, Open Loop)

<![if !supportLists]>• <![endif]>Full script generation with timestamps, B-roll cues, and CTA placement

<![if !supportLists]>• <![endif]>Tone control — select from: Educational, Entertaining, Motivational, Controversial, Storytelling

<![if !supportLists]>• <![endif]>Platform presets — YouTube (8-15 min), Shorts/Reels (30-90 sec), LinkedIn (60-90 sec)

<![if !supportLists]>• <![endif]>Script-to-hook repurposing — auto-generate 5 short-form hooks from any long-form script

<![if !supportLists]>• <![endif]>Hinglish / regional language support for Indian creators

<![if !supportLists]>• <![endif]>Script version history and A/B variant generation

**User Flow**

<![if !supportLists]>◦ <![endif]>User inputs: Topic + Target Audience + Platform + Tone

<![if !supportLists]>◦ <![endif]>AI generates 3 hook options — user selects one

<![if !supportLists]>◦ <![endif]>Full script is generated with timestamps and B-roll notes

<![if !supportLists]>◦ <![endif]>User can edit inline, regenerate sections, or request variations

<![if !supportLists]>◦ <![endif]>Script is saved and exported as PDF / teleprompter view

**MODULE 2 — Video Editing with Claude Skills**

**Overview**

AI-assisted video editing module that uses Claude skills to generate editing briefs, auto-captions, b-roll suggestions, and cut points from uploaded transcripts or video files.

**Key Features**

<![if !supportLists]>• <![endif]>Auto-transcript analysis — upload transcript, get timestamped edit points

<![if !supportLists]>• <![endif]>Claude editing brief — generates a detailed editing instruction doc for human or AI editors

<![if !supportLists]>• <![endif]>B-roll keyword list — auto-generated from script for stock footage sourcing (Pexels/Pixabay API)

<![if !supportLists]>• <![endif]>Caption style generator — 3 caption style options (bold, minimal, viral) with timing data

<![if !supportLists]>• <![endif]>Clip sequence suggester — recommends best clip order for maximum retention

<![if !supportLists]>• <![endif]>Hook clip identifier — pinpoints the 0-3 second hook moment from transcript

<![if !supportLists]>• <![endif]>Export to editing briefs (PDF / Notion / Google Docs)

  

**MODULE 3 — Carousel & Graphic Maker**

**Overview**

Generate scroll-stopping Instagram/LinkedIn carousels and static graphics from a topic, blog post, or video script using AI content + templated design output.

**Key Features**

<![if !supportLists]>• <![endif]>Carousel outline generator — AI creates a 5-10 slide narrative structure

<![if !supportLists]>• <![endif]>Slide copy writer — punchy 1-3 line text per slide optimized for carousel engagement

<![if !supportLists]>• <![endif]>Design templates — 10+ Canva-compatible templates with brand color injection

<![if !supportLists]>• <![endif]>Cover slide headline optimizer — tests 5 headline variants

<![if !supportLists]>• <![endif]>Call-to-action slide builder — slide 2 CTA and final slide CTA copy

<![if !supportLists]>• <![endif]>Export to Canva template link or image assets (PNG/JPG)

<![if !supportLists]>• <![endif]>Brand kit integration — saves logo, fonts, colors for consistent output

**MODULE 4 — Content Idea Engine**

**Overview**

AI-powered content ideation engine that generates weeks of content ideas tailored to your niche, audience, and current trends.

**Key Features**

<![if !supportLists]>• <![endif]>Niche-specific idea generator — input niche + audience, get 30 content ideas

<![if !supportLists]>• <![endif]>Trend-surfing mode — uses web search to find trending topics in niche and generate relevant ideas

<![if !supportLists]>• <![endif]>Content pillars framework — organizes ideas under 4-5 strategic content pillars

<![if !supportLists]>• <![endif]>Viral angle finder — takes a topic and generates 10 unique angles to make it shareable

<![if !supportLists]>• <![endif]>30-day content calendar generator — full monthly plan with topics, formats, and platforms

<![if !supportLists]>• <![endif]>Idea rating system — rates each idea on Shareability, SEO value, and Effort

<![if !supportLists]>• <![endif]>Repurposing map — for any idea, shows 6 formats it can be turned into

**MODULE 5 — Competitor Intelligence**

**Overview**

Analyze competitor channels, profiles, and content strategies using AI to extract insights, identify content gaps, and find opportunities to outperform.

**Key Features**

<![if !supportLists]>• <![endif]>Competitor profile analysis — paste any YouTube/Instagram URL and get an AI breakdown

<![if !supportLists]>• <![endif]>Top content audit — identifies the top 10 performing posts/videos and why they worked

<![if !supportLists]>• <![endif]>Content gap finder — topics your competitors cover that you don't (and vice versa)

<![if !supportLists]>• <![endif]>Posting frequency & format analysis — cadence, content mix, format breakdown

<![if !supportLists]>• <![endif]>Hook & thumbnail analysis — analyzes what visual/verbal patterns competitors use

<![if !supportLists]>• <![endif]>Opportunity report — generates a strategic PDF with your competitive edge recommendations

<![if !supportLists]>• <![endif]>Swipe file builder — save competitor content patterns for inspiration

  

**MODULE 6 — Content Page Setup Assistant**

**Overview**

A guided setup assistant that helps creators build and optimize their content presence — bio, profile, link-in-bio, channel about section, pinned posts, highlights, and SEO metadata.

**Key Features**

<![if !supportLists]>• <![endif]>Bio writer — platform-specific bios for Instagram, YouTube, LinkedIn, Twitter/X

<![if !supportLists]>• <![endif]>Channel / page keyword optimizer — adds searchable keywords to bios and descriptions

<![if !supportLists]>• <![endif]>Highlight cover naming & strategy — names and themes for Instagram story highlights

<![if !supportLists]>• <![endif]>Link-in-bio page copy — headline, sub-headline, CTA copy for Linktree / Beacons pages

<![if !supportLists]>• <![endif]>YouTube channel description writer with keyword integration

<![if !supportLists]>• <![endif]>Pinned post / featured content strategy — recommends what to pin and why

<![if !supportLists]>• <![endif]>Profile audit report — grades existing profile and suggests improvements

**MODULE 7 — Thumbnail Maker**

**Overview**

AI-powered thumbnail strategy and briefing tool that generates thumbnail concepts, headline text, visual directions, and Canva/design briefs for every piece of content.

**Key Features**

<![if !supportLists]>• <![endif]>Thumbnail concept generator — 5 unique thumbnail concepts per video/post

<![if !supportLists]>• <![endif]>Headline text optimizer — short, punchy thumbnail text (2-5 words) tested for CTR

<![if !supportLists]>• <![endif]>Visual direction brief — color palette, facial expression, background, props suggestions

<![if !supportLists]>• <![endif]>Canva prompt generator — ready-to-paste design prompts for Canva AI or designers

<![if !supportLists]>• <![endif]>A/B thumbnail test planner — framework to test 2 thumbnail variants and analyze results

<![if !supportLists]>• <![endif]>Thumbnail swipe file — save winning thumbnail patterns by niche/format

<![if !supportLists]>• <![endif]>Platform size presets — YouTube (1280x720), Instagram (1:1, 4:5), LinkedIn

**MODULE 8 — Content Growth Strategy Engine**

**Overview**

An AI strategist that builds personalized, data-informed content growth strategies. Covers posting schedule, platform strategy, monetization roadmap, and audience growth milestones.

**Key Features**

<![if !supportLists]>• <![endif]>Growth audit — analyzes current content performance and identifies biggest growth levers

<![if !supportLists]>• <![endif]>90-day growth plan — week-by-week content strategy with milestones

<![if !supportLists]>• <![endif]>Platform-specific strategy — different plans for YouTube, Instagram, LinkedIn

<![if !supportLists]>• <![endif]>Monetization roadmap — maps content growth to revenue milestones (brand deals, courses, services)

<![if !supportLists]>• <![endif]>Algorithm optimization guide — platform-specific tips for reach, engagement, and retention

<![if !supportLists]>• <![endif]>Audience persona builder — builds a detailed ideal audience profile from niche inputs

<![if !supportLists]>• <![endif]>Engagement prompt library — DM scripts, comment reply templates, CTA frameworks

  

# 4. Technical Architecture

## 4.1 Tech Stack

**Layer**

**Technology**

**Purpose**

Frontend

Next.js + Tailwind CSS

Web app UI / dashboard

Backend

Node.js + Express

API layer, auth, data handling

AI Engine

Claude Sonnet (Anthropic API)

All content generation modules

Database

Supabase (PostgreSQL)

User data, saved content, brand kits

File Storage

Supabase Storage / S3

Exported files, assets, swipe files

Automation

Make.com / n8n

Workflow triggers, scheduled tasks

Web Search

Tavily API / Brave Search

Trend surfing, competitor research

Design Export

Canva API + custom templates

Carousel and thumbnail output

Auth

Supabase Auth / Clerk

User authentication, team roles

Payments

Razorpay + Stripe

Subscription billing (India + Global)

## 4.2 Claude AI Integration

Each ContentOS module uses a dedicated Claude system prompt and skill set. Claude is accessed via the Anthropic API (claude-sonnet-4-20250514) with module-specific configurations:

<![if !supportLists]>• <![endif]>Custom system prompts per module — each module has a specialized prompt defining tone, output format, and constraints

<![if !supportLists]>• <![endif]>Structured JSON output — Claude returns structured data that the frontend renders dynamically

<![if !supportLists]>• <![endif]>Multi-turn conversations — users can iterate on any output through follow-up prompts

<![if !supportLists]>• <![endif]>Tool use / web search — Trend Surfing and Competitor Intelligence modules use Claude with web search tools

<![if !supportLists]>• <![endif]>Document inputs — Script and Editing modules accept uploaded transcripts (PDF / TXT)

<![if !supportLists]>• <![endif]>Memory context — user brand kit, niche, and platform preferences persist across sessions

## 4.3 Data Models

**Entity**

**Key Fields**

**Notes**

User

id, name, email, plan, brand_kit_id

Auth via Supabase

Brand Kit

logo_url, colors[], fonts[], tone, niche, platforms[]

Per-user content identity

Project

id, user_id, module, title, status, created_at

Tracks each AI session

Content Output

id, project_id, type, content_json, version

Versioned AI outputs

Swipe File

id, user_id, category, notes, source_url

Competitor + inspo saves

Subscription

user_id, plan, status, renewal_date, api_credits

Billing state

  

# 5. UX & Product Design Principles

## 5.1 Design Philosophy

**Speed First**

Every module should produce a usable output in under 30 seconds. Loading states must feel productive, not empty.

**Creator-Led**

AI outputs are starting points, not final answers. Every module allows editing, regeneration, and fine-tuning.

**Opinionated Defaults**

ContentOS makes smart decisions by default (platform, tone, format) and lets power users override. No blank slates.

**Unified Brand Identity**

The Brand Kit flows through every module automatically — users never repeat their niche or platform preferences.

## 5.2 Core UX Flows

**Flow**

**Steps**

**Goal**

Onboarding

1. Set niche  2. Build brand kit  3. Choose primary platform  4. First script

First value in < 5 min

Script Creation

1. Input topic  2. Choose tone  3. Select hook  4. Get full script  5. Export

Script in 60 seconds

Competitor Scan

1. Paste URL  2. Select analysis depth  3. Get intelligence report

Insights in 90 seconds

Carousel Creation

1. Input topic  2. AI outlines slides  3. Design brief  4. Canva export

Carousel ready in 2 min

Monthly Planning

1. Confirm niche  2. AI generates 30-day calendar  3. Assign to queue

Month planned in 3 min

  

# 6. Pricing & Plans

**Feature**

**Free**

**Creator (₹1999/mo)**

**Agency (₹5999/mo)**

Script Writer

5/month

Unlimited

Unlimited (multi-client)

Carousel Maker

3/month

30/month

Unlimited

Content Ideas

10 ideas/month

Unlimited

Unlimited

Competitor Analysis

1 scan/month

10 scans/month

Unlimited

Video Editing Brief

2/month

20/month

Unlimited

Thumbnail Maker

3/month

Unlimited

Unlimited

Growth Strategy

Basic

Full 90-day plan

Multi-client strategies

Brand Kit

1

1

Up to 10 clients

Team Members

1

1

Up to 5

Export Formats

Copy only

PDF + Canva + Docs

All + API access

Support

Community

Email

Priority + Onboarding call

  

# 7. Success Metrics & KPIs

**Category**

**Metric**

**Target (90 days)**

Acquisition

Signups

2,000+

Activation

Users who complete onboarding + run first module

60%+

Retention

D7 retention

40%+

Retention

D30 retention

25%+

Revenue

Paid subscribers

300+

Revenue

MRR

₹6,00,000+

Engagement

Avg modules used per session

2.5+

Quality

User satisfaction (NPS)

50+

Output

Total content outputs generated

50,000+

Virality

Referral rate (referred/total)

20%+

  

# 8. Product Roadmap

**PHASE 1 — MVP (Month 1-2)**

<![if !supportLists]>• <![endif]>Script Writing Engine — full release

<![if !supportLists]>• <![endif]>Content Idea Engine — full release

<![if !supportLists]>• <![endif]>Thumbnail Maker — brief + concept generator

<![if !supportLists]>• <![endif]>Brand Kit — basic setup (niche, platform, tone)

<![if !supportLists]>• <![endif]>User auth + dashboard + export (copy/PDF)

<![if !supportLists]>• <![endif]>Free + Creator plan billing via Razorpay

**PHASE 2 — Growth (Month 3-4)**

<![if !supportLists]>• <![endif]>Carousel Maker — full Canva integration

<![if !supportLists]>• <![endif]>Content Page Setup Assistant

<![if !supportLists]>• <![endif]>Competitor Intelligence — basic scan

<![if !supportLists]>• <![endif]>30-day Content Calendar

<![if !supportLists]>• <![endif]>Agency plan + team accounts

<![if !supportLists]>• <![endif]>Referral program

**PHASE 3 — Scale (Month 5-6)**

<![if !supportLists]>• <![endif]>Video Editing Brief Generator — full release

<![if !supportLists]>• <![endif]>Growth Strategy Engine — 90-day planner

<![if !supportLists]>• <![endif]>Trend Surfing (web search integration)

<![if !supportLists]>• <![endif]>Full Competitor Intelligence — deep scan + gap analysis

<![if !supportLists]>• <![endif]>API access for Agency plan

<![if !supportLists]>• <![endif]>Mobile app (React Native)

  

# 9. Risks, Assumptions & Constraints

## 9.1 Key Assumptions

<![if !supportLists]>• <![endif]>Creators are willing to pay for AI tools that save them 10+ hours per week

<![if !supportLists]>• <![endif]>Claude API will remain stable and cost-effective at scale

<![if !supportLists]>• <![endif]>Canva API will support template-level export integration

<![if !supportLists]>• <![endif]>Indian market will respond well to Hinglish language support in script modules

## 9.2 Risks & Mitigations

**Risk**

**Impact**

**Mitigation**

API rate limits at scale

High

Implement queue system + caching for common outputs

Low-quality AI output

High

Module-specific prompt engineering + output rating system

Canva API restrictions

Medium

Build fallback: downloadable template files (PNG/PDF)

Competitor clone (e.g. existing tools add AI)

Medium

Move fast on unique UX + niche creator community

User churn after free tier

Medium

Strong activation email sequence + quick wins in onboarding

AI hallucinations in competitor data

Low-Med

Add disclaimer, manual review option, cited sources

  

# 10. Appendix

## 10.1 Competitive Landscape

**Tool**

**What They Do**

**ContentOS Advantage**

Jasper AI

General AI writing for marketing

Creator-specific + full workflow (not just copy)

Opus Clip

AI video repurposing

ContentOS covers full creation, not just repurposing

Canva AI

Design with AI features

Content strategy + scripting + editing brief (not just design)

VidIQ / TubeBuddy

YouTube SEO tools

Full content OS vs. single-platform analytics

Copy.ai

AI copy generation

End-to-end content workflow vs. copy snippets

Notion AI

Docs + workspace AI

Creator-specific workflows, not general productivity

## 10.2 Glossary

<![if !supportLists]>• <![endif]>Hook — The opening 3-5 seconds of a video or first line of a post designed to stop the scroll

<![if !supportLists]>• <![endif]>B-roll — Supporting footage used in video editing to illustrate points made in the main footage

<![if !supportLists]>• <![endif]>Content Pillar — A core topic or theme that anchors a creator's content strategy

<![if !supportLists]>• <![endif]>Brand Kit — A collection of brand identity assets: colors, fonts, tone of voice, niche, and platforms

<![if !supportLists]>• <![endif]>Claude Skill — A specialized, prompt-engineered configuration of Claude AI optimized for a specific task

<![if !supportLists]>• <![endif]>Carousel — A multi-slide Instagram/LinkedIn post format used for educational or storytelling content

<![if !supportLists]>• <![endif]>CTR — Click-Through Rate; percentage of viewers who click a thumbnail or link

<![if !supportLists]>• <![endif]>Repurposing — Adapting one piece of content into multiple formats for different platforms

**ContentOS AI — Product Requirements Document**

Built by Growthax  |  Confidential — Do Not Distribute  |  v1.0 May 2026
