---
name: AI Portfolio Manager
overview: Implement the AI-powered portfolio manager that analyzes community needs and automatically distributes funds with intelligent explanations.
todos:
  - id: ai-config
    content: Set up AI provider configuration (OpenAI/Anthropic) and API client
    status: pending
  - id: distribution-algorithm
    content: Implement core distribution calculation algorithm with weight calculation and allocation logic
    status: pending
  - id: convex-functions
    content: Create Convex functions for distribution calculation and execution
    status: pending
  - id: ai-explanations
    content: Build AI explanation generation with prompt engineering for distribution reasons
    status: pending
  - id: report-narratives
    content: Create AI-powered report narrative generation for personalized weekly reports
    status: pending
  - id: scheduled-job
    content: Set up Convex scheduled function for weekly automatic distribution
    status: pending
  - id: preview-page
    content: Create admin preview page for distribution before execution
    status: pending
  - id: caching
    content: Implement caching for AI responses to reduce API calls
    status: pending
  - id: error-handling
    content: Add error handling, retries, and fallback explanations
    status: pending
  - id: testing
    content: Test distribution algorithm and AI explanations with various scenarios
    status: pending
isProject: false
---

# AI Portfolio Manager

## Overview

This plan covers the AI Portfolio Manager system that analyzes community needs, calculates optimal fund distributions, and generates human-readable explanations for allocations. Uses the AI SDK already installed.

## AI Configuration

### File: `lib/ai/config.ts`

AI provider configuration:

- OpenAI or Anthropic API setup
- Model selection
- API key management
- Rate limiting configuration

## Distribution Algorithm

### File: `lib/ai/distribution.ts`

Core distribution calculation logic:

**Algorithm Steps:**

1. **Data Collection**

   - Get all active subscriptions for target week
   - Group by city
   - Get approved charities per city
   - Get current needs data for each charity

2. **Weight Calculation**

   - Calculate urgency weight: `urgencyScore / 100`
   - Calculate gap weight: `min(fundingGap / totalCityFunds, 1.0)`
   - Calculate combined weight: `urgencyWeight * 0.6 + gapWeight * 0.4`
   - Normalize weights to sum to 1.0

3. **Allocation**

   - Allocate funds proportionally based on weights
   - Ensure minimum allocation (e.g., $1) if charity is selected
   - Distribute remainder to top-weighted charities

4. **Diversity**

   - Ensure category diversity (don't put all funds in one category)
   - Cap maximum allocation per charity (e.g., 40% of total)
   - Balance between urgency and diversity

### File: `convex/portfolioManager.ts`

Convex functions for distribution:

**Functions:**

- `calculateDistribution` (mutation) - Calculate optimal distribution for a city
- `distributeFunds` (mutation) - Execute distribution and create records
- `getDistributionPreview` (query) - Preview without executing

**Input:**

- City name
- Week start date
- Total funds available

**Output:**

- Array of { charityId, amount, weight, reason }

## AI Explanation Generation

### File: `lib/ai/explanations.ts`

Generate human-readable explanations for each distribution:

**Function: `generateDistributionExplanation`**

**Input:**

- Charity information
- Amount allocated
- Urgency score
- Funding gap
- Context (other charities, total funds)

**Prompt Template:**

```
Explain why ${amount} was allocated to ${charityName} this week.

Context:
- Urgency Score: ${urgencyScore}/100
- Funding Gap: $${fundingGap}
- Category: ${category}
- Total funds available: $${totalFunds}
- Other charities in need: ${otherCharitiesCount}

Generate a brief (2-3 sentences), warm, and transparent explanation that helps the donor understand the impact.
```

**Output:**

- Natural language explanation (2-3 sentences)
- Impact-focused language
- Transparent reasoning

### File: `lib/ai/reportNarrative.ts`

Generate personalized report narratives:

**Function: `generateReportNarrative`**

**Input:**

- User's distributions for the week
- Total impact
- Historical context

**Output:**

- Personalized weekly report narrative
- Highlights key impacts
- Celebrates user's contribution

## Scheduled Distribution

### File: `convex/scheduled.ts`

Weekly cron job (runs Monday mornings):

**Function: `weeklyDistribution`**

**Steps:**

1. Get all active subscriptions
2. Group by city
3. For each city:

   - Calculate total funds for the week
   - Run distribution algorithm
   - Generate AI explanations for each allocation
   - Create distribution records in Convex
   - Update subscription `lastDistributionDate`

4. Trigger report generation

**Error Handling:**

- Retry failed distributions
- Log errors
- Notify admins of failures

## Distribution Preview

### File: `app/(dashboard)/admin/distribution-preview/page.tsx`

Admin preview page:

- Preview distribution for upcoming week
- Show calculated allocations
- Show AI explanations
- Allow manual adjustments (future)
- Execute distribution manually

## AI Model Selection

**Options:**

- OpenAI GPT-4 or GPT-3.5-turbo (cost-effective)
- Anthropic Claude (better reasoning)
- Local model (privacy-focused, future)

**Recommendation:** Start with GPT-3.5-turbo for cost, upgrade to GPT-4 if quality needed.

## Prompt Engineering

### Distribution Explanation Prompts

**System Prompt:**

```
You are a transparent community investment assistant. Your role is to explain fund allocations in a warm, clear, and impactful way. Focus on the human impact and why this allocation matters.
```

**User Prompt Template:**

```
Charity: ${name}
Amount: $${amount}
Urgency: ${urgencyScore}/100
Funding Gap: $${fundingGap}
Category: ${category}

Explain why this charity received this allocation this week. Be specific about the need and impact. Keep it to 2-3 sentences.
```

### Report Narrative Prompts

**System Prompt:**

```
You are a community impact storyteller. Create personalized, inspiring narratives about how weekly donations made a difference.
```

## Caching and Optimization

### File: `lib/ai/cache.ts`

Cache AI responses:

- Cache explanations for similar distributions
- Reduce API calls
- Improve response time

## Error Handling

- Retry logic for API failures
- Fallback to template explanations if AI fails
- Logging for debugging
- Graceful degradation

## Environment Variables

```
OPENAI_API_KEY=
# OR
ANTHROPIC_API_KEY=
```

## Dependencies

- Requires Convex plan for data access
- Uses AI SDK for API calls
- Integrates with scheduled jobs

## Testing

- Unit tests for distribution algorithm
- Integration tests for AI explanations
- Test with various city/fund scenarios
- Validate explanation quality

## Implementation Steps

1. Set up AI provider configuration
2. Implement core distribution algorithm
3. Create Convex functions for distribution
4. Build AI explanation generation
5. Create report narrative generation
6. Set up scheduled weekly distribution job
7. Create admin preview page
8. Add caching and optimization
9. Implement error handling and fallbacks
10. Test with real data scenarios