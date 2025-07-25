import { SectionPrompt } from '../types/proposal';

// Define the default section prompts
export const defaultSectionPrompts: SectionPrompt[] = [
  {
    sectionTitle: 'Introduction',
    isDefault: true,
    customPrompt: `Write a simple Introduction section with exactly this format:

{yourCompany.name}
[Company description based on provided information]
Website: {yourCompany.website}

{clientCompany.name}
[Company description based on provided information]  
Website: {clientCompany.website}

REQUIREMENTS:
- Use the exact company names as headings
- Write one paragraph for each company
- Include the website for each company
- STOP after the second company's website
- DO NOT add project information, collaboration details, or additional content`,
    exampleContent: `{yourCompany.name}
Since its inception, {yourCompany.name} has been partnering with its global clients, some of which are Fortune 1000 companies, that leverage and rely on our broad portfolio of Digital Transformation, Software Architecture/R&D, Customer Care/BPO, E-commerce, Software services, Quality Assurance, Analytics/ML and Cloud Engineering offerings. Led by a strong leadership group, the globally acclaimed service firm today supports over 100 clients across North America, the Middle East, Europe, and APAC, with offices in the U.S., Europe, India, and the Philippines. Supported by outstanding talent, {yourCompany.name} blends technical and functional expertise with comprehensive cross-vertical and cross-domain knowledge to help achieve business objectives. Its consistent successes have led to global recognition from Deloitte twice, first as one of India's Fast 50 Technology companies and secondly as one of Asia's Fast 500 Technology companies. {yourCompany.name} is an official Microsoft Gold Certified partner, as well as a Salesforce Partner. {yourCompany.name}'s clientele is primarily international, mainly based in the US and UK.

{clientCompany.name}
{clientCompany.description}`
  },
  {
    sectionTitle: 'Definitions and Acronyms',
    isDefault: true,
    customPrompt: `Create a Definitions and Acronyms section with a professional table format. Start with just "# Definitions and Acronyms" as the header. Include:

REQUIRED ENTRIES:
- Client: {clientCompany.name} and its Affiliates
- {yourCompany.name}: [Short form/abbreviation for your company]
- Project: {project.title}

ADDITIONAL RELEVANT ACRONYMS:
Add 5-8 relevant technical or business acronyms based on the project description and services. Examples might include:
- SEO, PPC, CRM, API, SaaS, ROI, KPI, etc. (choose what's relevant to the project)

FORMAT:
| Acronym | Explanation |
|---|---|
| [entries here] |

Keep it concise and relevant to this specific project and companies.`,
    exampleContent: `The acronyms that may be encountered in this document are listed in the table below:

| Acronym | Explanation |
|---|---|
| Client | {clientCompany.name} and its Affiliates |
| {yourCompany.name}/INTG | {yourCompany.name} |
| AFFILIATES | Any Holding Company and Subsidiary Company of the Holding Company |
| CR | Change Request |
| SH | Stake Holder |
Table 1`
  },
  {
    sectionTitle: 'Objective',
    isDefault: true,
    customPrompt: `Write a clear, concise Objective section that defines the primary goals of this project. Start with just "# Objective" as the header. Include:

PRIMARY OBJECTIVE:
- Main business goal or outcome the client wants to achieve
- Specific focus areas based on the service description: {project.serviceDescription}

SECONDARY OBJECTIVES:
- 2-3 supporting goals that align with the primary objective
- Measurable outcomes where applicable

TARGET MARKET:
- Geographic focus: {project.targetGeo}
- Any relevant market or industry specifics

Keep it professional, specific to this project, and focused on business outcomes rather than technical details.`,
    exampleContent: `To drive qualified, purchase-ready traffic to the Client's product listings on Walmart.com and generate consistent sales for the brand's core longevity supplement line in the US market. This engagement will focus on Phase 1 of the Client's marketplace growth strategy: establishing Walmart.com as a profitable, performance-driven sales channel.

{yourCompany.name} will provide end-to-end marketing support across campaign execution, keyword optimization, Marketplace SEO, creative design (Ads & rich media assets like product images), Walmart A+ creation, and content delivery, ensuring the brand stands out in a competitive supplements category.

The aim is to validate product-market fit on Walmart, build a sales pipeline, and set the foundation for expansion into platforms like Amazon in later stages.`
  },
  {
    sectionTitle: 'Scope',
    isDefault: true,
    customPrompt: `Create a comprehensive Scope section that clearly defines what is included in this project. Start with just "# Scope" as the header. Structure it as:

PROJECT SCOPE OVERVIEW:
- Brief summary of what this engagement covers
- Key service areas from: {project.serviceDescription}

INCLUDED SERVICES:
- Break down the main service categories into 3-5 key areas
- List specific deliverables under each area
- Use clear headings and bullet points

GEOGRAPHIC/MARKET SCOPE:
- Target market: {project.targetGeo}
- Any relevant market-specific considerations

PHASES OR TIMELINE:
- If applicable, break into phases or implementation stages
- High-level timeline expectations

Keep it specific, actionable, and directly tied to the service description provided.`,
    exampleContent: `This engagement covers Phase 1 of the client's marketplace growth plan, focused exclusively on Walmart.com. The objective is to drive qualified traffic, improve catalog readiness, and deliver trackable sales impact through high-efficiency campaigns and listing enhancements.

Phase 1 is divided into 2 tracks:

Part A: Store Optimisation

Sponsored Products setup (Auto + Manual campaign structure)

Sponsored Brands campaign configuration

Keyword strategy – seed + harvest method with ROAS-based planning

Initial content audit and SKU selection for optimization

Listing improvements:

Titles, bullets, and descriptions (SEO + user readability)

Rich media asset creation (product & lifestyle imagery)

Walmart A+ Content creation (as per eligibility)

Attribute enrichment and variant cleanup

Suppression fixes (pricing issues, policy flags, keyword violations)

Competitive benchmarking (top 3 SKUs per product line/category)

Part B: Ongoing Optimization & Reporting (Monthly)

Campaign monitoring and weekly performance adjustments

Bid tuning, budget reallocation, and negative keyword filtering

Regular testing and optimization of creatives, offers and promotions including:

Custom headlines

Ad copy

Static banners

Platform adapts

Performance reporting etc

Weekly/Monthly reporting with actionable insights and next steps

Ongoing product page refinement for top movers or flagged SKUs

Phase 2 (Future)

Expansion to Amazon, Target+, or {clientCompany.website} (DTC) will be proposed once the Walmart channel proves profitable and scalable. This will follow a milestone-based trigger model.`
  },
  {
    sectionTitle: 'Solution Framework',
    isDefault: true,
    customPrompt: `Create a detailed Solution Framework section that explains the methodology and approach. Start with just "# Solution Framework" as the header. Include:

METHODOLOGY OVERVIEW:
- High-level approach or framework being used
- Key principles or strategies guiding the implementation

IMPLEMENTATION APPROACH:
- 3-5 main implementation areas based on: {project.serviceDescription}
- Specific methods, tools, or techniques for each area
- How different components work together

PROCESS WORKFLOW:
- Step-by-step process or workflow
- Dependencies and sequencing
- Quality assurance or validation steps

TOOLS AND TECHNOLOGIES:
- Key platforms, tools, or technologies to be used
- Integration points and data flow

Make it detailed enough to demonstrate expertise while remaining accessible to business stakeholders.`,
    exampleContent: `This outlines how we'll improve Walmart performance for up to 4 priority SKUs in Phase 1 - keeping it lean, impact-focused, and ready for scale.

Product Content Optimization:

Rewrite product titles, bullets, and descriptions using high-intent, benefit-led copy backed by marketplace SEO keyword research.

Build and deploy rich media assets (Product/Supplementary Images) as per best practice & Walmart's guidelines

Build and deploy Walmart A+ (Enhanced) Content with ingredient visuals, lifestyle use-cases, and compliance-ready formatting. (Subject to Walmart's eligibility satisfaction)

Align all content with Walmart's SEO and UI standards to support quality scores and ad performance.

Catalog Health Management:

Run monthly catalog audits to detect suppressed, underperforming, or non-compliant SKUs.

Enrich backend attributes (e.g., dosage, allergens, certifications) for filter visibility and trust triggers.

Fix taxonomy issues, set up parent-child variants, and ensure the catalog meets Walmart's listing best practices.

Paid Media Management (Walmart Ads):

Launch and manage Sponsored Products campaigns, starting with Auto for discovery, then expanding to Manual for control.

Set up Sponsored Brands (headline) ads where eligibility and creative assets allow.

Optimize ads weekly with bid adjustments, keyword pruning, and harvest cycles, tracking ROAS, CTR, and ACOS.

Coordinate Walmart-native promotions to align with high-traffic weeks.`
  },
  {
    sectionTitle: 'Deliverables',
    isDefault: true,
    customPrompt: `Create a clear Deliverables section with specific outputs and timelines. Start with just "# Deliverables" as the header. Include:

MAIN DELIVERABLES:
- List 5-8 key deliverables based on: {project.serviceDescription}
- Organize by category or phase
- Include specific outputs, formats, or assets

DELIVERY TIMELINE:
- Timeline for each deliverable
- Dependencies or sequencing
- Review and approval cycles

QUALITY STANDARDS:
- Quality criteria or success metrics
- Review process and stakeholder involvement
- Revision cycles included

Use tables or structured lists to make deliverables clear and actionable.`,
    exampleContent: `This section outlines the key deliverables and responsibilities for both parties, ensuring a structured execution path aligned with the Client's Phase 1 objectives.

| S.No. | Task Category | Key Deliverables | Responsibility |
|---|---|---|---|
| 1 | Product Content | SEO audit, title/bullet/description rewrite, Walmart A+ content creation, rich media assets (product / supplementary images) creation for top 3-4 SKUs | INTG |
| 2 | Catalog Health | Suppression fixes, attribute enrichment, taxonomy cleanup, variant setup, and competitor benchmarking | INTG |
| 3 | Paid Campaigns | Setup, launch & manage Sponsored Products (Auto + Manual), Sponsored Brands (if eligible), bid tuning, keyword optimization, ROAS tracking | INTG |
| 4 | Performance Reporting | Weekly ad + catalog performance summary; monthly insight reports, issues, and data-backed next steps | INTG |

Table 2

For Walmart, we are proposing the following distribution of budget by campaign type. The estimates total $2,000 including test campaigns. Please note that we may choose to shift budgets between campaign types based on actual performance.

| Ad Type | Purpose | % of Budget | Budget (USD) |
|---|---|---|---|
| Sponsored Products – Auto | Discovery + keyword harvesting (broad reach, low maintenance) | 30% | $600 |
| Sponsored Products – Manual (Exact) | Target high-converting keywords discovered via Auto + research | 35% | $700 |
| Sponsored Products – Manual (Phrase/Broad) | Mid-funnel targeting + ASIN target campaigns | 15% | $300 |
| Sponsored Brands (if eligible) | Brand visibility with banner ads on search results | 15% | $300 |
| Test Budget / A/B Reserve | New SKU, seasonal, or competitor retargeting tests | 5% | $100 |

Table 3`
  },
  {
    sectionTitle: 'Client Responsibilities',
    isDefault: true,
    customPrompt: `Define clear Client Responsibilities to ensure project success. Start with just "# Client Responsibilities" as the header. Include:

KEY RESPONSIBILITIES:
- Designate single point of contact (SPOC)
- Provide timely access to necessary systems/platforms
- Share required assets, guidelines, and approvals
- Meet agreed timelines for feedback and decisions

SPECIFIC REQUIREMENTS:
- List 5-7 specific responsibilities based on: {project.serviceDescription}
- Include data, access, or resource requirements
- Timeline expectations for client deliverables

APPROVAL PROCESS:
- Review and approval cycles
- Decision-making authority
- Escalation procedures

Keep it professional and specific to ensure clear expectations.`,
    exampleContent: `To ensure seamless execution, the Client agrees to:

Designate a Single Point of Contact (SPOC) who will act as the authorized representative for all project-related decisions and approvals.

Provide timely and complete access to Walmart Seller Center, Ad Console, Brand Portal, and creative asset repositories.

The Client shall share a finalized list of up to 3-4 SKUs in advance, in alignment with Walmart promotion guidelines.

For video assets, the shoots/videos will be provided by the Client.

Share relevant brand guidelines, existing creative assets (FOP & BOP of Product), Product details & certifications and any gated product information required for content development.

Participate in creative and campaign reviews by providing feedback and approvals within agreed turnaround times.

Approve and align promotional mechanics, eligible SKUs, and any ad-hoc budget reallocation needed for performance campaigns.

Obtain all necessary internal and third-party authorizations for {yourCompany.name} to access and modify non-INTG platforms or materials without legal restriction.

Provide timely input and decisions to prevent project delays and ensure performance continuity.`
  },
  {
    sectionTitle: 'Limitations',
    isDefault: true,
    customPrompt: `Create a clear Limitations section that sets proper expectations. Start with just "# Limitations" as the header. Include:

OUT OF SCOPE:
- 5-7 specific items that are NOT included in this project
- Related services that might be assumed but aren't covered
- Future phases or additional work not in current scope

CONSTRAINTS AND DEPENDENCIES:
- Performance limitations or external dependencies
- Platform or technology constraints
- Market or regulatory limitations

REVISION LIMITS:
- Number of revision cycles included
- Additional work or change request procedures

Keep it professional and help manage client expectations appropriately.`,
    exampleContent: `To maintain project clarity and manage expectations, the following are out of scope for this SOW:

Support for Amazon, Target+, or {clientCompany.website} (DTC) platforms, unless separately scoped and contracted under Phase 2.

Influencer outreach, affiliate program setup, or external PR/media buys.

Advanced motion/video production beyond basic Sponsored Video assets (custom shoots, 3D renderings, or lifestyle ads are not included).

Walmart DSP campaigns, unless explicitly activated by client request, with separate creative and media planning.

Each content or creative asset includes a maximum of 2 rounds of feedback.

Performance is dependent on platform algorithms and market dynamics. While we use proven methods, guarantees around sales or ROAS are not provided.

Paid media ad budget is not included in this SOW and will be handled directly by the client via Walmart Ad Center.`
  },
  {
    sectionTitle: 'General Operations',
    isDefault: true,
    customPrompt: `Create a General Operations section covering operational aspects. Start with just "# General Operations" as the header. Include:

GOVERNANCE MODEL:
- Reference to governing agreements (NDA, MSA)
- Operational framework and reporting structure

WORKING ARRANGEMENTS:
- Service delivery location and team setup
- Working hours and time zones
- Communication protocols

CONTRACT TERMS:
- Contract duration and start/end dates
- Extension procedures
- Key operational policies

FACILITIES AND COVERAGE:
- Service delivery locations
- Hours of operation
- Holiday schedules

Keep it professional and comprehensive for operational clarity.`,
    exampleContent: `## Governance Model for Operation

This SOW shall be governed by the Non-Disclosure Agreement (NDA) dated ______ & Master Service Agreement (MSA) dated _______ executed between Client and {yourCompany.name}, including but not limited to the terms of termination, non-solicitation, non-poaching, force majeure, etc.

## Facilities and Hours of Coverage

Services shall be performed from {yourCompany.name}'s India development center.

{yourCompany.name} shall provide the Services during normal business hours, 11:00 AM IST to 8:00 PM IST. Monday through Friday, except for the statutory holidays defined in , unless otherwise specified.

## Contract Duration

This SOW shall be valid for twelve (12) months with mutually agreed extensions. Any delay in the delivery due to the requisite information from the Client's end shall be treated as an extension to the present SOW as per the mutual discussion and consideration of the Parties (whereby email is sufficient).

Estimated Start Date: 21st July 2025

Estimated End Date: 20th July 2026

Contract Term:

If the SOW signature date is beyond the Estimated Start Date, then the Estimated Start Date will automatically be extended to the date of the last signature on this SOW. The Estimated End Date will automatically be extended by the same number of days.`
  },
  {
    sectionTitle: 'Commercial Proposal',
    isDefault: true,
    customPrompt: `Create a comprehensive Commercial Proposal section. Start with just "# Commercial Proposal" as the header. Include:

PRICING STRUCTURE:
- Monthly or project-based fees
- Use the annual budget: {project.annualBudget} as reference
- Break down pricing by phases or service components
- Any setup or one-time fees

BILLING AND PAYMENT TERMS:
- Invoicing schedule and payment terms
- Late payment policies
- Currency and tax considerations

ADDITIONAL COSTS:
- Any variable costs or additional services
- Third-party costs or platform fees
- Change request pricing

CONTRACT TERMS:
- Payment milestones or schedules
- Contract duration and renewal terms
- Cancellation policies

Use tables for clarity and ensure all commercial terms are transparent.`,
    exampleContent: `This engagement is structured as a 12-month partnership with a phased billing model to support initial ramp-up and optimization. All commercials are billed in USD.

| Phase | Scope Covered | Monthly Fee |
|---|---|---|
| Part A: Months 1–4 | Full SKU optimization (up to 4 SKUs), content creation, listing hygiene, PPC campaign setup + launch, reporting foundation | $2,000/month |
| Part B: Months 5–12 | PPC-centric creative services: custom headlines, ad copy, static banners, platform adapts, and performance reporting | $1,000/month |
| Part B: Months 5–12 | Bid tuning, campaign scaling, ROAS optimization and budget distribution | $0 |
| Optional Add-ons | Additional SKUs, custom dashboards, seasonal campaigns, video/rich media production | $200 / SKU |
| Ad Budget | Walmart PPC campaigns – Paid directly to Walmart via the ad portal | As per actuals -Est. $2,000/month |

Table 4

## Terms and Conditions

Invoices shall be raised monthly, on or before the 7th of each month.

All payments are due within 15 calendar days of receipt of the invoice.

Any stock imagery purchased for use in creatives will be charged on actuals, billed separately based on the platform used (e.g., Shutterstock, etc.).

Any request to replace previously approved SKUs with new SKUs will be treated as a fresh creative cycle and charged at $200 per SKU, or $2000 for a full set rotation, as per the selected tier.

The paid media budget will have to be pre-approved before start of month

If Ad budget has to be paid by client then that has to be paid directly to Walmart via the ad portal

If {yourCompany.name} is required to fund the client's advertising campaigns:

To be paid in advance

Applicable government taxes (e.g., GST at 18%)

To avoid these additional charges, the Client is encouraged to directly fund the advertising accounts.

Applicable payment gateway or bank transfer fees (typically USD 50 per transaction) will be added to the invoice.

The rates contained in are limited to the Scope mentioned under this SOW and do not apply to the other projects agreed between {yourCompany.name} and the Client.

## Wire Transfer Instructions:

| Receiving Bank | DEUTSCHE BANK |
|---|---|
| Bank SWIFT Code | ABCD1234 |
| Bank Address | the address, New Delhi – 110001. |
| Beneficiary Name | moving go Pvt. Ltd. |
| Beneficiary Bank Account Number | 000011114444666 |
| IFSC Code (Other Payment Information) | ABCD1234 |
| Beneficiary Address | Mayur Vihar, Delhi-110096 |
| Purpose of payment Code | "SOFTWARE CONSULTANCY SERVICES" SWIFT CODE DEUTINBBPBC SEND THROUGH DEUTSCHE BANK U.S.A. TO  MUMBAI BANK FINALLY NEW DELHI. |

Table 5`
  },
  {
    sectionTitle: 'Termination',
    isDefault: true,
    customPrompt: `Create a clear Termination section covering contract termination procedures. Start with just "# Termination" as the header. Include:

TERMINATION PROCEDURES:
- Notice period required (typically 30 days)
- Termination process and requirements
- Rights of both parties

POST-TERMINATION OBLIGATIONS:
- Payment for completed work
- Asset and data return procedures
- Ongoing obligations or restrictions

FINAL DELIVERABLES:
- Work product delivery upon termination
- Final billing and payment procedures
- Knowledge transfer requirements

SIGNATURE SECTION:
- Signature blocks for both companies
- Include company names: {yourCompany.name} and {clientCompany.name}
- Date and title fields

Keep it professional and legally appropriate.`,
    exampleContent: `Either Party may terminate this SOW by giving 30 days advance written notice to the other Party. After the termination, the CLIENT shall:

pay any outstanding {yourCompany.name} charges for Services performed and pre-approved documented expenses under this SOW.

Agree to pay {yourCompany.name} for actual hours worked through the termination of the Services. CLIENT will be charged only for the actual hours {yourCompany.name} expends in performing the Services.

{yourCompany.name}           {clientCompany.name}

By                                                      By

Name: ________                  Name: ________

Title: ________                 Title: ________

Date ________                   Date: ________`
  }
];

export const defaultFallbackPrompt = `Write a professional {sectionTitle} section for a Statement of Work document.

Client Company: {clientCompany.name}
Client Description: {clientCompany.description}

Your Company: {yourCompany.name}
Company Description: {yourCompany.description}

Project Title: {project.title}
Service Description: {project.serviceDescription}
{project.annualBudget ? \`Annual Project Budget: \${project.annualBudget}\` : ''}
{project.targetGeo ? \`Target Geographic Area: \${project.targetGeo}\` : ''}

IMPORTANT: Write ONLY the content for the "{sectionTitle}" section. Do not include section headings, titles, or any other parts of the document. Just provide the body content for this specific section that would appear under the "{sectionTitle}" heading.

Please write comprehensive, professional content that is appropriate for this section of a Statement of Work document. Use clear formatting with bullet points, numbered lists, or tables where appropriate. Make it specific to this project and companies involved.`;

export const defaultPromptWithExamples = `Write a professional {sectionTitle} section for a Statement of Work document.

Client Company: {clientCompany.name}
Client Description: {clientCompany.description}

Your Company: {yourCompany.name}
Company Description: {yourCompany.description}

Project Title: {project.title}
Service Description: {project.serviceDescription}
{project.annualBudget ? \`Annual Project Budget: \${project.annualBudget}\` : ''}
{project.targetGeo ? \`Target Geographic Area: \${project.targetGeo}\` : ''}

Example for # {sectionTitle}:
{exampleContent}

IMPORTANT: Write ONLY the content for the "{sectionTitle}" section. Do not include section headings, titles, or any other parts of the document. Just provide the body content for this specific section that would appear under the "{sectionTitle}" heading.

Please write comprehensive, professional content that is appropriate for this section of a Statement of Work document. Use the example above as a reference for style and structure, but adapt it specifically to this project and companies involved.`;

// Export default sections in the format expected by PromptEditor
export const defaultSections = defaultSectionPrompts.map(section => ({
  title: section.sectionTitle,
  prompt: section.customPrompt || defaultPromptWithExamples
    .replace(/{sectionTitle}/g, section.sectionTitle)
    .replace('{exampleContent}', section.exampleContent || ''),
  example: section.exampleContent
}));