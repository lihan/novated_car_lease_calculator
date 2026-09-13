<p align="center">
  <img src="./public/novate-logo.svg" alt="Novate" width="190" />
</p>

# Novate — Australian novated lease calculator

![Novate calculator screenshot](./public/calculator-screenshot.png)

> **[Try the live demo →](https://lihan.github.io/novated_car_lease_calculator/)**

Novate is a client-side Australian novated lease calculator. It answers the practical question: **how much will the lease reduce my take-home pay, and what will I pay in total, including the residual?**

Built with Next.js 16.3.5, React 19.3, strict TypeScript, and Tailwind CSS 4. The interface is available in English and Simplified Chinese. No database, authentication, API keys, or calculation backend is used, and input data stays in the browser.

## What it does

Enter the vehicle, salary, lease, and running-cost assumptions to get an estimate that updates as you edit. The page keeps the flow in one readable sequence:

1. Complete the inputs, grouped by vehicle, salary, lease, life on the road, and advanced settings.
2. Review the monthly take-home impact, annual decrease, tax and GST benefit, and residual payable.
3. Compare the same scenario across one- to five-year lease terms.
4. Inspect the lean calculation ledger, with the formulas, substituted values, and results shown as math.

The calculator supports battery-electric, plug-in hybrid, and petrol vehicles, progressive income tax, Medicare, GST, FBT/employee contributions, English/Chinese translation, reset-to-demo defaults, keyboard navigation, and responsive desktop/mobile layouts. It is an estimate rather than a quote or personal tax, financial, or legal advice.

## Rule versions and updates

Every rule configuration carries its financial year, source, URL, verification date and legislated/proposed status. The active-rule guard rejects proposed rules and mixed financial years. Proposed EV measures are a separate metadata record and never enter the main calculation.

**This release is a constant FY2026–27 scenario projection.** It intentionally holds the tax snapshot, income, prices and FBT treatment constant across every lease year. It does not claim to apply future tax cuts, future threshold indexation or future FBT reforms. Even already announced/legislated future-year changes require their own rule files before a calendar-aware projection can be offered. Lease dates inform EV eligibility; they do not prorate salary deductions or FBT days.

To update:

1. Read the primary legislation/ATO source and confirm effective dates, transitional conditions and current status.
2. Add a new rule module, preserving historical versions. Record exactly what was verified and when; never copy a verification date without checking.
3. Update the active rule set, metadata links and assumptions together. Keep proposals separate.
4. Add boundary tests, independent worked examples and whole-scenario reconciliation cases before activation.
5. Run the complete check suite, including live browser tests. Obtain specialist review before presenting a new tax treatment as reliable financial guidance.

This calculator is an estimation tool, not personal tax, financial or legal advice.

## Run locally

Use Node.js 24 (the version in `.nvmrc`), then install dependencies and start the development server:

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). To verify the static export locally, run `npm run build`; the generated site is written to `out/`.
