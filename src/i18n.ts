import type { CalculationSection, CalculationStep } from '@/calculator/types';

export type Locale = 'en' | 'zh';

const messages: Record<Locale, Record<string, string>> = {
  en: {
    language: 'Language',
    english: 'English',
    chinese: 'Chinese',
    switchToEnglish: 'Switch to English',
    switchToChinese: 'Switch to Chinese',
    selectedEnglish: 'English selected',
    selectedChinese: 'Chinese selected',
    novateHome: 'Novate home',
    mainNavigation: 'Main navigation',
    calculator: 'Calculator',
    results: 'Results',
    financialYear: 'FY 2026–27',
    enableJavaScript:
      'Enable JavaScript for live calculations. The values below show the demo scenario.',
    introEyebrow: 'AUSTRALIAN NOVATED LEASE CALCULATOR',
    introTitle: 'Estimate your novated lease costs',
    introDescription:
      'Enter your salary, car and lease details to estimate the monthly take-home impact and the total cost over the lease term, including income-tax and GST effects.',
    estimatesOnly: 'Estimates only.',
    everyNumberShowsWorking: 'Each number shows its working.',
    step2Inputs: 'STEP 2 · YOUR INPUTS',
    buildEstimate: 'Build your estimate',
    startWithEssentials: 'Start with the essentials. Results update as you edit.',
    resetDemoScenario: 'Reset to demo scenario',
    vehicleHeading: 'Your vehicle',
    vehicleDescription: 'Price, type and FBT eligibility',
    vehiclePriceIncludingGst: 'Vehicle price including GST',
    carPrice: 'Car price',
    onRoadChargesAdded: 'On-road charges are added below.',
    includesGstAdvanced: 'Includes GST. Add an on-road breakdown in advanced settings.',
    includesGst: 'Includes GST.',
    vehicleType: 'Vehicle type',
    batteryElectric: 'Battery electric (BEV)',
    petrol: 'Petrol',
    diesel: 'Diesel',
    hybrid: 'Hybrid',
    plugInHybrid: 'Plug-in hybrid (PHEV)',
    eligibilityDetailsBelow: 'Based on the eligibility details below',
    employeeContributionApplied: 'Employee contribution estimate applied',
    salaryHeading: 'Your salary',
    salaryDescription: 'Gross income before tax',
    grossAnnualSalary: 'Gross annual salary',
    beforeTaxExcludingSuper: 'Before tax, excluding employer super.',
    leaseHeading: 'Your lease',
    leaseDescription: 'Term, rate and administration fee',
    leaseDuration: 'Lease duration',
    year: 'year',
    years: 'years',
    effectiveInterest: 'Effective lease interest rate',
    monthlyBalloonModel: 'Monthly balloon model. Confirm the rate in your quote.',
    administrationFee: 'Administration fee',
    includingGst: 'Including GST.',
    lifeOnRoadHeading: 'Life on the road',
    lifeOnRoadDescription: 'Driving and running-cost assumptions',
    annualKilometres: 'Annual kilometres driven',
    evEfficiency: 'EV efficiency',
    electricityPrice: 'Electricity price',
    electricityPriceHint:
      'Average public charger: $0.55/kWh. Home charging is typically $0.08–$0.30/kWh.',
    fuelEfficiency: 'Fuel efficiency',
    fuelPrice: 'Fuel price',
    insurance: 'Insurance',
    moreRunningCosts: 'More running costs',
    annualRegistration: 'Annual registration',
    compulsoryThirdParty: 'Compulsory third party (CTP)',
    ctpHint: 'Kept separate from registration and comprehensive insurance.',
    servicing: 'Servicing',
    tyres: 'Tyres',
    otherRunningCosts: 'Other running costs',
    advancedSettings: 'Advanced settings',
    advancedDescription: 'Optional tax, GST and after-tax details',
    adjustOptionalSettings: 'Adjust optional settings',
    priceGstTreatment: 'Price & GST treatment',
    breakDownOnRoadCharges: 'Break down on-road charges',
    purchaseRegistration: 'Purchase registration (no GST)',
    stampDuty: 'Stamp duty (no GST)',
    dealerCharges: 'Dealer / on-road charges incl. GST',
    otherPurchaseCharges: 'Other purchase charges (no GST)',
    onRoadChargesNote:
      'These are added to vehicle price. Annual registration above is a separate recurring cost.',
    insuranceDuties: 'Insurance duties / non-GST charges',
    energyGstInvoices: 'Energy has eligible GST invoices',
    energyGstNote:
      'Home charging usually needs specific substantiation. Electricity credits are off in the demo.',
    otherRunningGst: 'Other running costs have eligible GST',
    evExemptionEligibility: 'EV exemption eligibility',
    firstHeldAndUsed: 'First held and used',
    leaseStartDate: 'Lease start date',
    lctPayableQuestion: 'Has luxury car tax ever been payable?',
    lctNo: 'No — confirmed / assumed in demo',
    lctYes: 'Yes',
    lctUnknown: 'I’m not sure',
    lctNote: 'Use the vehicle’s LCT history, not just today’s price.',
    taxCircumstances: 'Your tax circumstances',
    helpDebt: 'I have a HELP / HECS debt',
    privateHospitalCover: 'Appropriate private hospital cover all year',
    familyStatus: 'Family status for Medicare',
    single: 'Single',
    family: 'Family / eligible sole parent',
    dependants: 'Eligible dependent children',
    spouseIncome: 'Spouse taxable income',
    soleParentHint: 'Enter zero if you are an eligible sole parent.',
    taxCircumstancesNote:
      'HELP repayments and Medicare levy surcharge are not modelled. Reportable fringe benefits can affect both.',
    otherAfterTaxCosts: 'Other after-tax costs',
    upfrontCosts: 'Upfront costs outside the lease',
    endLeaseCosts: 'End-of-lease costs (excl. residual)',
    fieldNumberError: 'Enter a complete valid number. Keeping the last valid result.',
    keepingLastValid: 'Keeping the last valid scenario.',
    numbersStayInBrowser: 'Your numbers stay in your browser.',
    step3Results: 'STEP 3 · RESULTS',
    resultsTitle: 'Your results',
    resultsHelper: 'Review the monthly impact first, then the full lease cost.',
    updatesAsEdit: 'Updates as you edit',
    takeHomeSummary: 'Take-home pay summary',
    monthlyTakeHomeDecrease: 'MONTHLY PAYMENT',
    month: 'month',
    impactDescription:
      'After income-tax and Medicare savings, this covers your lease and budgeted running costs.',
    residualPaidSeparately: 'The final residual is paid separately.',
    monthlyMaths: 'Monthly maths:',
    packageDeduction: 'package deduction',
    incomeTaxMedicareSaved: 'income tax and Medicare saved',
    afterTaxTakeHomeImpact: 'after-tax take-home impact.',
    onYourPayslip: 'ON YOUR PAYSLIP',
    grossPackageDeduction: 'Gross package deduction',
    incomeTaxMedicareSavedShort: 'Income tax + Medicare saved',
    actualAfterTaxImpact: 'Actual after-tax take-home impact',
    afterTaxMonthlyResidual: 'After-tax monthly impact · residual payable separately',
    annualTakeHomeDecrease: 'Annual Cost (out-of-pocket)',
    perYearDuringLease: 'Per year, during the lease',
    taxGstBenefit: 'Tax + GST benefit',
    residualPayable: 'Residual payable',
    residualBasisIncludesGst: 'residual basis · includes GST',
    estimateNotQuote: 'An estimate, not a quote.',
    constantTaxScenario: 'Uses a constant FY2026–27 tax scenario.',
    confirmGstThresholds: 'Confirm GST thresholds and provider treatment before committing.',
    leaseTermSimulation: 'LEASE TERM SIMULATION',
    compareTerms: 'Compare 1–5 year terms',
    compareTermsDescription:
      'See how the term changes your monthly impact, residual, savings and total out-of-pocket cost.',
    termSimulationCaption: 'Lease-term simulation for one through five years',
    leaseTerm: 'Lease term',
    monthlyTakeHome: 'Monthly cost',
    residual: 'Residual',
    interest: 'Interest',
    administration: 'Administration',
    runningCosts: 'Running costs',
    taxMedicareSaved: 'Tax + Medicare saved',
    gstSaved: 'GST saved',
    totalBeforeTaxSupport: 'Total before tax support',
    totalOutOfPocket: 'Total out-of-pocket',
    selected: 'Selected',
    lowestTotal: 'Lowest total',
    selectedTermNote:
      'The selected term is highlighted. “Lowest total” compares the modeled out-of-pocket cost across the five terms; no resale value is assumed.',
    costComparison: 'COST COMPARISON',
    compareOutright: 'Buy outright vs novated lease',
    compareOutrightDescription: 'Compare total out-of-pocket cost over your selected term.',
    outOfPocketComparison: 'Total out-of-pocket cost',
    buyOutright: 'Buy outright',
    novatedLease: 'Novated lease',
    comparisonSelectedTerm: 'Selected term',
    estimatedDifference: 'ESTIMATED DIFFERENCE',
    novatedSaves: 'Novated lease saves',
    novatedCostsMore: 'Novated lease costs more',
    sameModeledCost: 'Both options cost the same',
    comparedWithOutright: 'compared with buying outright.',
    comparisonNote:
      'The outright option pays the vehicle upfront. Both options include running costs for the selected term, retain the vehicle at the end and assume no resale value.',
    superImpact: 'SUPERANNUATION CHECK',
    superImpactTitle: 'Potential employer super loss',
    superImpactDescription:
      'If your employer calculates super on a reduced base salary, the pre-tax package deduction may reduce the super guarantee paid on your behalf.',
    superAnnualLoss: 'Potential annual super loss',
    superTermLoss: 'Potential loss over selected term',
    superFormula: '(Capped super base before − capped super base after) × SG rate',
    superWorking: 'Working',
    superReducedSalary: 'Salary after pre-tax reduction',
    superCappedBaseAfter: 'Capped super base after',
    superExcluded: 'Separate estimate · not included in calculator totals',
    superCapBase: 'ATO annual SG earnings cap',
    superMaxPayment: 'Maximum SG at 12%',
    perFinancialYear: 'per financial year',
    superCapNote:
      'For FY2026–27, the ATO maximum contribution base is $270,830 per year. At 12%, minimum SG is capped at $32,499.60; once qualifying earnings reach the base, no further minimum SG is required for that year.',
    superNoLoss:
      'The annual cap absorbs the full salary reduction in this scenario, so no potential SG loss is shown.',
    superAssumption:
      'This estimate compares the capped superable salary before and after the pre-tax package deduction. The cap resets each financial year, so the selected-term figure assumes the same salary and package each year. It does not change the lease calculation.',
    step4Working: 'STEP 4 · WORKING',
    allCalculationSteps: 'All calculation steps',
    showWorking: 'Show all calculation steps',
    hideWorking: 'Hide all calculation steps',
    workingHelper: 'Formula → substituted values → result.',
    howCalculated: 'How is this calculated?',
    unroundedValues: 'Unrounded values',
    precisionNote: 'Calculations retain full precision. Currency shown above is rounded to cents.',
    result: 'Result',
    independentEstimator: 'An independent estimator, not personal financial advice.',
    footerLabel: 'Australian novated lease calculator · AUD',
  },
  zh: {
    language: '语言',
    english: 'English',
    chinese: '中文',
    switchToEnglish: '切换到英文',
    switchToChinese: '切换到中文',
    selectedEnglish: '已选择英文',
    selectedChinese: '已选择中文',
    novateHome: 'Novate 首页',
    mainNavigation: '主导航',
    calculator: '计算器',
    results: '结果',
    financialYear: '财年 2026–27',
    enableJavaScript: '请启用 JavaScript 以进行实时计算。下方数值显示的是演示方案。',
    introEyebrow: '澳大利亚薪资打包租赁计算器',
    introTitle: '估算Novated Lease成本与开支',
    introDescription:
      '输入薪资、车辆和租赁信息，估算每月到手工资影响以及整个租赁期间的总成本，包括所得税和 GST 的影响。',
    estimatesOnly: '仅供估算。',
    everyNumberShowsWorking: '每个数字都显示计算过程。',
    step2Inputs: '步骤 2 · 输入信息',
    buildEstimate: '建立你的估算',
    startWithEssentials: '先填写基本信息。编辑时结果会实时更新。',
    resetDemoScenario: '重置为演示方案',
    vehicleHeading: '你的车辆',
    vehicleDescription: '价格、类型与 FBT 资格',
    vehiclePriceIncludingGst: '含 GST 的车辆价格',
    carPrice: '车辆价格',
    onRoadChargesAdded: '上路费用将在下方添加。',
    includesGstAdvanced: '含 GST。可在高级设置中拆分上路费用。',
    includesGst: '含 GST。',
    vehicleType: '车辆类型',
    batteryElectric: '纯电动车（BEV）',
    petrol: '汽油车',
    diesel: '柴油车',
    hybrid: '混合动力车',
    plugInHybrid: '插电式混合动力车（PHEV）',
    eligibilityDetailsBelow: '根据下方资格信息判断',
    employeeContributionApplied: '已应用员工缴款估算',
    salaryHeading: '你的薪资',
    salaryDescription: '税前总收入',
    grossAnnualSalary: '年度税前总薪资',
    beforeTaxExcludingSuper: '税前金额，不包括雇主养老金。',
    leaseHeading: '你的租赁',
    leaseDescription: '期限、利率和管理费',
    leaseDuration: '租赁期限',
    year: '年',
    years: '年',
    effectiveInterest: '有效租赁利率',
    monthlyBalloonModel: '按月计算尾款的模型。请在报价中确认利率。',
    administrationFee: '管理费',
    includingGst: '含 GST。',
    lifeOnRoadHeading: '道路生活',
    lifeOnRoadDescription: '驾驶和运行成本假设',
    annualKilometres: '每年行驶公里数',
    evEfficiency: '电动车能耗',
    electricityPrice: '电价',
    electricityPriceHint: '公共充电桩平均价格：$0.55/千瓦时。家庭充电通常为 $0.08–$0.30/千瓦时。',
    fuelEfficiency: '燃油效率',
    fuelPrice: '油价',
    insurance: '保险',
    moreRunningCosts: '更多运行成本',
    annualRegistration: '年度车辆注册费',
    compulsoryThirdParty: '强制第三方保险（CTP）',
    ctpHint: '与注册费和综合保险分开计算。',
    servicing: '保养',
    tyres: '轮胎',
    otherRunningCosts: '其他运行成本',
    advancedSettings: '高级设置',
    advancedDescription: '可选税务、GST 和税后费用详情',
    adjustOptionalSettings: '调整可选设置',
    priceGstTreatment: '价格与 GST 处理',
    breakDownOnRoadCharges: '拆分上路费用',
    purchaseRegistration: '购车注册费（无 GST）',
    stampDuty: '印花税（无 GST）',
    dealerCharges: '经销商 / 上路费用（含 GST）',
    otherPurchaseCharges: '其他购车费用（无 GST）',
    onRoadChargesNote: '这些费用会加入车辆价格。上方的年度注册费是单独的持续费用。',
    insuranceDuties: '保险税费 / 非 GST 费用',
    energyGstInvoices: '能源费用有合资格的 GST 发票',
    energyGstNote: '家庭充电通常需要特定凭证。演示方案未启用电费抵免。',
    otherRunningGst: '其他运行成本包含合资格 GST',
    evExemptionEligibility: '电动车豁免资格',
    firstHeldAndUsed: '首次持有并使用日期',
    leaseStartDate: '租赁开始日期',
    lctPayableQuestion: '是否曾经需要缴纳豪华汽车税（LCT）？',
    lctNo: '否 — 演示方案已确认 / 假定',
    lctYes: '是',
    lctUnknown: '不确定',
    lctNote: '请参考车辆的 LCT 历史，而不只是当前价格。',
    taxCircumstances: '你的税务情况',
    helpDebt: '我有 HELP / HECS 教育贷款',
    privateHospitalCover: '全年拥有合适的私人住院保险',
    familyStatus: 'Medicare 家庭情况',
    single: '单身',
    family: '家庭 / 符合资格的单亲家长',
    dependants: '符合资格的受抚养子女',
    spouseIncome: '配偶应税收入',
    soleParentHint: '如果你是符合资格的单亲家长，请输入零。',
    taxCircumstancesNote:
      '本模型不计算 HELP 还款和 Medicare levy surcharge；应申报的福利可能影响两者。',
    otherAfterTaxCosts: '其他税后费用',
    upfrontCosts: '租赁之外的前期费用',
    endLeaseCosts: '租赁结束费用（不含残值）',
    fieldNumberError: '请输入完整且有效的数字。将保留上一个有效结果。',
    keepingLastValid: '将保留上一个有效方案。',
    numbersStayInBrowser: '你的数据只保存在浏览器中。',
    step3Results: '步骤 3 · 结果',
    resultsTitle: '你的结果',
    resultsHelper: '先查看每月影响，再查看整个租赁成本。',
    updatesAsEdit: '编辑时实时更新',
    takeHomeSummary: '到手工资摘要',
    monthlyTakeHomeDecrease: '每月付款',
    month: '每月',
    impactDescription: '扣除所得税和 Medicare 节省后，该金额覆盖租赁及预算内的运行成本。',
    residualPaidSeparately: '最终残值需另行支付。',
    monthlyMaths: '每月计算：',
    packageDeduction: '薪资打包扣款',
    incomeTaxMedicareSaved: '节省的所得税和 Medicare',
    afterTaxTakeHomeImpact: '税后到手工资影响。',
    onYourPayslip: '工资单显示',
    grossPackageDeduction: '薪资打包总扣款',
    incomeTaxMedicareSavedShort: '节省的所得税 + Medicare',
    actualAfterTaxImpact: '实际税后到手工资影响',
    afterTaxMonthlyResidual: '每月税后影响 · 残值另行支付',
    annualTakeHomeDecrease: '年度成本（自付）',
    perYearDuringLease: '租赁期间每年',
    taxGstBenefit: '税务 + GST 收益',
    residualPayable: '应付残值',
    residualBasisIncludesGst: '残值基数 · 含 GST',
    estimateNotQuote: '这是估算，不是报价。',
    constantTaxScenario: '采用固定的 2026–27 财年税务方案。',
    confirmGstThresholds: '签约前请确认 GST 门槛及服务商的处理方式。',
    leaseTermSimulation: '租赁期限模拟',
    compareTerms: '比较 1–5 年期限',
    compareTermsDescription: '查看期限如何改变每月影响、残值、节省和自付总成本。',
    termSimulationCaption: '一至五年租赁期限模拟',
    leaseTerm: '租赁期限',
    monthlyTakeHome: '每月成本',
    residual: '残值',
    interest: '利息',
    administration: '管理费',
    runningCosts: '运行成本',
    taxMedicareSaved: '节省的税费 + Medicare',
    gstSaved: '节省的 GST',
    totalBeforeTaxSupport: '税务支持前总额',
    totalOutOfPocket: '自付总额',
    selected: '当前选择',
    lowestTotal: '最低总额',
    selectedTermNote: '当前期限以高亮显示。“最低总额”比较五种期限的模拟自付成本；未假设转售价值。',
    costComparison: '成本比较',
    compareOutright: '全款购买 vs Novated Lease',
    compareOutrightDescription: '比较所选期限内的自付总成本。',
    outOfPocketComparison: '自付总成本',
    buyOutright: '全款购买',
    novatedLease: 'Novated Lease',
    comparisonSelectedTerm: '所选期限',
    estimatedDifference: '预计成本差异',
    novatedSaves: 'Novated Lease 节省',
    novatedCostsMore: 'Novated Lease 成本更高',
    sameModeledCost: '两种方案成本相同',
    comparedWithOutright: '相比全款购买。',
    comparisonNote:
      '全款购买会先支付车辆价格。两种方案都包含所选期限内的运行成本，期末保留车辆，并且不假设转售价值。',
    superImpact: '养老金提示',
    superImpactTitle: '潜在雇主养老金损失',
    superImpactDescription:
      '如果雇主按降低后的基本薪资计算 Super Guarantee（SG），税前薪资打包扣款可能减少雇主代你缴纳的养老金。',
    superAnnualLoss: '预计每年养老金损失',
    superTermLoss: '所选期限预计损失',
    superFormula: '（上限前可计养老金基数 − 上限后可计养老金基数）× SG 费率',
    superWorking: '计算过程',
    superReducedSalary: '税前扣款后的薪资',
    superCappedBaseAfter: '应用上限后的养老金基数',
    superExcluded: '独立估算 · 不计入计算器现有总额',
    superCapBase: 'ATO 年度 SG 收入上限',
    superMaxPayment: '按 12% 计算的最高 SG',
    perFinancialYear: '每个财年',
    superCapNote:
      '2026–27 财年 ATO 的最高缴纳基数为每年 $270,830。按 12% 计算，最低 SG 每年最多为 $32,499.60；当合资格收入达到该基数后，该财年不再需要继续缴纳最低 SG。',
    superNoLoss: '本方案中的年度上限已覆盖全部薪资减少额，因此不显示潜在 SG 损失。',
    superAssumption:
      '本估算比较税前薪资打包扣款前后的可计养老金薪资基数，并应用年度上限。该上限每个财年重置，因此所选期限金额假设每年薪资和打包金额不变，不会改变租赁计算结果。',
    step4Working: '步骤 4 · 计算过程',
    allCalculationSteps: '全部计算步骤',
    showWorking: '显示全部计算步骤',
    hideWorking: '隐藏全部计算步骤',
    workingHelper: '公式 → 代入数值 → 结果。',
    howCalculated: '如何计算？',
    unroundedValues: '未四舍五入的数值',
    precisionNote: '计算保留完整精度。上方货币金额四舍五入到分。',
    result: '结果',
    independentEstimator: '独立估算工具，不构成个人财务建议。',
    footerLabel: '澳大利亚薪资打包租赁计算器 · AUD',
  },
};

export function translate(locale: Locale, key: string): string {
  return messages[locale][key] ?? messages.en[key] ?? key;
}

const textTranslations: Record<string, string> = {
  'Vehicle purchase price': '车辆购车价格',
  'Vehicle GST treatment': '车辆 GST 处理',
  'Amount financed': '融资金额',
  'Residual calculation': '残值计算',
  'Finance lease payments': '融资租赁付款',
  'Electricity / fuel usage': '用电 / 燃油用量',
  'Running expenses': '运行费用',
  'Administration fees': '管理费用',
  'Salary packaging and FBT treatment': '薪资打包与 FBT 处理',
  'Taxable salary before lease': '租赁前应税薪资',
  'Income tax before lease': '租赁前所得税',
  'Medicare before lease': '租赁前 Medicare',
  'Taxable salary after lease': '租赁后应税薪资',
  'Income tax after lease': '租赁后所得税',
  'Medicare after lease': '租赁后 Medicare',
  'Income-tax and Medicare savings': '所得税与 Medicare 节省',
  'GST and total benefit': 'GST 与总收益',
  'Gross package deduction': '薪资打包总扣款',
  'Take-home pay impact': '到手工资影响',
  'Final after-tax residual payment': '最终税后残值付款',
  'Total out-of-pocket cost': '自付总成本',
  'GST paid on final residual': '最终残值支付的 GST',
  'Vehicle / lease income-tax saving': '车辆 / 租赁所得税节省',
  'Charging / fuel income-tax saving': '充电 / 燃油所得税节省',
  'Other running-cost income-tax saving': '其他运行成本所得税节省',
  'Total annual income-tax saving': '年度所得税总节省',
  'Annual Medicare levy saving': '年度 Medicare levy 节省',
  'Net GST benefit across the lease': '整个租赁期间的净 GST 收益',
  'Total estimated tax + GST benefit': '预计税务 + GST 总收益',
  'Annual administration budget': '年度管理费预算',
  'After-tax employee contribution': '税后员工缴款',
  'Eligible annual pre-tax deduction': '合资格年度税前扣款',
  'Annual post-tax deduction': '年度税后扣款',
  'Gross annual package deduction': '年度薪资打包总扣款',
  'Gross monthly package deduction': '每月薪资打包总扣款',
  'Finance payments': '融资付款',
  'Running expenses, net GST': '运行费用（扣除 GST）',
  'Administration, net GST': '管理费（扣除 GST）',
  'Pre-tax portion': '税前部分',
  'Post-tax portion': '税后部分',
  'Take-home pay decrease': '到手工资减少',
  'Purchase expenditure before financing': '融资前购车支出',
  'Lifetime finance interest over selected term': '所选期限内的融资利息',
  'Running expenses over term': '期限内运行费用',
  'Administration over term': '期限内管理费',
  'Income tax + Medicare over term': '期限内所得税 + Medicare',
  'Net GST benefit over term': '期限内净 GST 收益',
  'Final residual payable': '应付最终残值',
  'Total out-of-pocket': '自付总额',
  Insurance: '保险',
  Registration: '注册费',
  'Compulsory third party (CTP)': '强制第三方保险（CTP）',
  Servicing: '保养',
  Tyres: '轮胎',
  'Other running costs': '其他运行成本',
  Charging: '充电',
  Fuel: '燃油',
  'Annual finance': '年度融资',
  'Administration net': '管理费净额',
  'Running costs net': '运行成本净额',
  Contribution: '员工缴款',
  'Unfunded shortfall': '未覆盖差额',
  'Annual deduction': '年度扣款',
  Salary: '薪资',
  'Net budget': '净预算',
  'Employee contribution': '员工缴款',
  'Contribution GST': '员工缴款 GST',
  'Original salary': '原始薪资',
  'Pre-tax deduction': '税前扣款',
  'Taxable salary': '应税薪资',
  'Original tax': '原始税额',
  'Tax after vehicle deduction': '扣除车辆费用后的税额',
  'Tax after vehicle': '扣除车辆费用后税额',
  'Tax after energy': '扣除能源费用后税额',
  'Final income tax': '最终所得税',
  Before: '之前',
  After: '之后',
  'Vehicle credit': '车辆抵免',
  'Annual running credits': '年度运行抵免',
  'Annual admin credits': '年度管理费抵免',
  'Annual contribution GST': '年度员工缴款 GST',
  Years: '年数',
  'Residual GST': '残值 GST',
  'Annual income-tax saving': '年度所得税节省',
  'Annual Medicare saving': '年度 Medicare 节省',
  'Net GST benefit': '净 GST 收益',
  'Annual take-home decrease': '年度到手工资减少',
  'Residual including GST': '含 GST 残值',
  'Upfront after tax': '税后前期费用',
  'End costs after tax': '税后结束费用',
  Months: '月数',
  'Monthly administration': '每月管理费',
  'Annual GST credit': '年度 GST 抵免',
  'Take-home pay without the lease': '不使用租赁时的到手工资',
  'Take-home pay with the lease': '使用租赁后的到手工资',
  'Annual take-home pay decrease': '年度到手工资减少',
  'Monthly take-home pay decrease': '每月到手工资减少',
  'Income in band × bracket rate': '税档收入 × 税档税率',
  'Gross expense − eligible GST component': '总费用 − 合资格 GST 部分',
  'Annual distance × consumption ÷ 100': '年度距离 × 能耗 ÷ 100',
  'Annual usage × price per unit': '年度用量 × 单位价格',
  'Annual energy expense ÷ 12': '年度能源费用 ÷ 12',
  'Annual running expenses before GST credits': '扣除 GST 抵免前的年度运行费用',
  'Annual running expenses in the package': '薪资打包中的年度运行费用',
  'Monthly running budget': '每月运行预算',
  'Eligible vehicle expenditure + non-GST charges': '合资格车辆支出 + 非 GST 费用',
  'Eligible GST-inclusive amount ÷ GST divisor': '合资格含 GST 金额 ÷ GST 除数',
  'min(included GST, maximum ordinary GST credit)': 'min(已含 GST, 普通 GST 最高抵免额)',
  'Included GST − recoverable GST': '已含 GST − 可回收 GST',
  'Total purchase price − recoverable vehicle GST': '车辆购车总价 − 可回收车辆 GST',
  'Lease value × residual percentage': '融资金额 × 残值比例',
  'Residual excluding GST × GST rate': '不含 GST 的残值 × GST 税率',
  'Residual excluding GST + GST': '不含 GST 的残值 + 残值 GST',
  'Annual rate ÷ 12': '年利率 ÷ 12',
  'Residual ÷ (1 + monthly rate)ⁿ': '残值 ÷ (1 + 月利率)ⁿ',
  'Monthly payment × months': '每月付款 × 月数',
  'Total payments + residual excluding GST − principal':
    '融资付款总额 + 不含 GST 的残值 − 融资金额',
  'Sum of bracket tax − LITO': '税档税额合计 − LITO',
  'Salary − income tax − Medicare': '薪资 − 所得税 − Medicare',
  'Salary − pre-tax package − post-tax contribution − income tax − Medicare':
    '薪资 − 税前打包 − 税后缴款 − 所得税 − Medicare',
  'Take-home without lease − take-home with lease': '不使用租赁时的到手工资 − 使用租赁后的到手工资',
  'Annual take-home decrease ÷ 12': '年度到手工资减少 ÷ 12',
  'Pre-tax deductions reduce taxable salary. Employee contributions and any unfunded package excess are paid after tax.':
    '税前扣款会减少应税薪资。员工缴款和未覆盖的打包超额部分在税后支付。',
  'Income tax and Medicare are deducted from salary. HELP and Medicare levy surcharge are excluded.':
    '所得税和 Medicare 会从薪资中扣除。本模型不包含 HELP 和 Medicare levy surcharge。',
  'The difference in spendable pay, including the lease and running budget.':
    '包括租赁和运行预算在内的可支配工资差额。',
  'This is the change to your pay, before setting money aside for the residual.':
    '这是工资的变化，不包含为残值预留的金额。',
  'Only the income within this band is taxed at this rate.': '只有该税档内的收入按此税率征税。',
  'The first taper applies only between the two income thresholds.':
    '第一段递减仅适用于两个收入门槛之间的部分。',
  'Income above the second threshold reduces the remaining offset. The final offset cannot fall below zero.':
    '超过第二门槛的收入会减少剩余抵免额，最终抵免额不会低于零。',
  'Non-refundable LITO is capped at income tax. It tapers across the configured thresholds.':
    '不可退还的 LITO 以上缴所得税为上限，并在设定的门槛之间递减。',
  'Progressive income tax less the low income tax offset. Medicare is calculated separately.':
    '累进所得税减去低收入税收抵免。Medicare 单独计算。',
  'The levy phases in above the low-income threshold, then the full rate applies above the phase-in limit.':
    'levy 在低收入门槛以上逐步增加，超过递进上限后适用完整税率。',
  'Each eligible dependent child increases the family threshold.':
    '每名合资格受抚养子女都会提高家庭门槛。',
  'The family reduction tapers away above the family threshold. Families at or below the threshold pay no levy.':
    '家庭收入超过家庭门槛后，家庭减免会逐步减少。收入不超过门槛的家庭无需缴纳 levy。',
  'If both spouses owe individual Medicare, allocate by taxable income; otherwise apply the reduction to the liable spouse.':
    '如果双方都需要缴纳个人 Medicare，则按应税收入分配；否则将减免应用于需要缴纳的一方。',
  'Any allocated reduction above your spouse’s individual levy transfers to you. No spouse allocation means no transfer.':
    '超过配偶个人 levy 的已分配减免会转给你。没有配偶分配时不会转移。',
  'Levy differences are separate from income tax.': 'levy 的差额与所得税分开计算。',
  'The annual budget spread across twelve months.': '年度预算平均分摊到十二个月。',
  'The net budget is what salary packaging funds.': '净预算是薪资打包需要覆盖的金额。',
};

export function translateText(locale: Locale, text: string): string {
  if (locale === 'en') return text;
  return textTranslations[text] ?? text;
}

const sectionTranslations: Record<string, string> = {
  purchase: '车辆购车价格',
  gst: '车辆 GST 处理',
  financed: '融资金额',
  residual: '残值计算',
  finance: '融资租赁付款',
  energy: '用电 / 燃油用量',
  running: '运行费用',
  admin: '管理费用',
  package: '薪资打包与 FBT 处理',
  'taxable-before': '租赁前应税薪资',
  'tax-before': '租赁前所得税',
  'medicare-before': '租赁前 Medicare',
  'taxable-after': '租赁后应税薪资',
  'tax-after': '租赁后所得税',
  'medicare-after': '租赁后 Medicare',
  'tax-savings': '所得税与 Medicare 节省',
  'gst-savings': 'GST 与总收益',
  gross: '薪资打包总扣款',
  'take-home': '到手工资影响',
  payout: '最终税后残值付款',
  total: '自付总成本',
};

const stepTranslations: Record<string, { title?: string; formula?: string }> = {
  'vehicle-price': {
    title: '车辆购车总价',
    formula: '合资格车辆支出 + 非 GST 费用',
  },
  'vehicle-gst-included': {
    title: '价格中包含的 GST',
    formula: '合资格含 GST 金额 ÷ GST 除数',
  },
  'vehicle-gst-credit': {
    title: '可回收的车辆 GST',
    formula: 'min(已含 GST, 普通 GST 最高抵免额)',
  },
  'vehicle-gst-unrecovered': {
    title: '不可回收的车辆 GST',
    formula: '已含 GST − 可回收 GST',
  },
  'amount-financed': {
    title: '融资金额',
    formula: '车辆购车总价 − 可回收车辆 GST',
  },
  'residual-net': {
    title: '不含 GST 的残值',
    formula: '融资金额 × 法定残值比例',
  },
  'residual-gst': {
    title: '残值 GST',
    formula: '不含 GST 的残值 × GST 税率',
  },
  'residual-payout': {
    title: '含 GST 的残值付款',
    formula: '不含 GST 的残值 + 残值 GST',
  },
  'monthly-rate': {
    title: '月利率',
    formula: '年利率 ÷ 12',
  },
  'pv-residual': {
    title: '残值现值',
    formula: '残值 ÷ (1 + 月利率) ^ 月数',
  },
  'finance-monthly': {
    title: '每月融资付款',
    formula: '(融资金额 − 残值现值) ÷ 年金系数 + 残值现值 × 月利率',
  },
  'finance-total': {
    title: '融资付款总额',
    formula: '每月融资付款 × 月数',
  },
  'finance-interest': {
    title: '融资利息总额',
    formula: '融资付款总额 − 融资金额 + 残值现值 − 残值',
  },
  'energy-usage': {
    title: '年度能源用量',
    formula: '年度距离 × 能耗 ÷ 100',
  },
  'energy-annual': {
    title: '年度能源费用',
    formula: '年度用量 × 单位价格',
  },
  'energy-monthly': {
    title: '每月能源费用',
    formula: '年度能源费用 ÷ 12',
  },
  'running-gross': {
    title: '扣除 GST 抵免前的年度运行费用',
    formula: '能源 + 保险 + 注册费 + CTP + 保养 + 轮胎 + 其他',
  },
  'running-net': {
    title: '薪资打包中的年度运行费用',
    formula: '年度运行总费用 − 运行成本 GST 抵免',
  },
  'running-monthly': {
    title: '每月运行预算',
    formula: '年度净运行费用 ÷ 12',
  },
  'admin-annual': {
    title: '年度管理费预算',
    formula: '每月管理费 × 12 − 管理费 GST 抵免',
  },
  'package-budget': {
    title: '年度净薪资打包预算',
    formula: '融资 + 管理费 + 运行成本',
  },
  ecm: {
    title: '税后员工缴款',
    formula: '豁免电动车：零；否则含 GST 的 FBT 基数 × 法定税率',
  },
  'package-pretax': {
    title: '合资格年度税前扣款',
    formula: 'min(薪资, max(0, 净预算 − 缴款 + 缴款 GST))',
  },
  'package-posttax': {
    title: '年度税后扣款',
    formula: '员工缴款 + 未覆盖的税前差额',
  },
  'package-gross': {
    title: '年度薪资打包总扣款',
    formula: '税前扣款 + 税后扣款',
  },
  'package-monthly': {
    title: '每月薪资打包总扣款',
    formula: '年度薪资打包扣款 ÷ 12',
  },
  'taxable-before': {
    title: '租赁前应税薪资',
    formula: '应税薪资 = 输入的年度薪资',
  },
  'taxable-after': {
    title: '租赁后应税薪资',
    formula: '原始薪资 − 税前扣款',
  },
  'lito-first-taper': {
    title: '第一段 LITO 递减',
    formula: 'max(0, min(收入, 第二门槛) − 第一门槛) × 第一递减率',
  },
  'lito-second-taper': {
    title: '第二段 LITO 递减',
    formula: 'max(0, 收入 − 第二门槛) × 第二递减率',
  },
  lito: {
    title: '低收入税收抵免',
    formula: 'min(税额, max(0, 最高抵免 − 第一段递减 − 第二段递减))',
  },
  'income-tax': {
    title: '应付所得税',
    formula: '税档税额合计 − LITO',
  },
  'medicare-individual': {
    title: '个人 Medicare levy',
    formula:
      '低于上限：min(收入 × levy 税率, max(0, 收入 − 门槛) × 递进税率)；否则收入 × levy 税率',
  },
  'medicare-family-threshold': {
    title: '家庭低收入门槛',
    formula: '家庭基础门槛 + 每名子女津贴 × 合资格子女数',
  },
  'medicare-family-reduction': {
    title: '可用的家庭 levy 减免',
    formula: 'max(0, levy 税率 × 门槛 −（递进税率 − levy 税率）× max(0, 家庭收入 − 门槛))',
  },
  'medicare-family-allocation': {
    title: '你在家庭减免中的份额',
    formula: '家庭减免 × 你的分配比例',
  },
  'medicare-family-transfer': {
    title: '转移未使用的配偶减免',
    formula: '配偶应缴：max(0, 家庭减免 × 配偶份额 − 配偶 levy)；否则为零',
  },
  'medicare-family': {
    title: '家庭 Medicare 调整',
    formula: '家庭门槛 = 基础门槛 + 每名子女津贴；levy = max(0, 个人 levy − 已分配减免 − 转移减免)',
  },
  'tax-vehicle-saving': {
    title: '车辆 / 租赁所得税节省',
    formula: '原始薪资税额 − 扣除车辆费用后的税额',
  },
  'tax-energy-saving': {
    title: '充电 / 燃油所得税节省',
    formula: '扣除车辆费用后的税额 − 扣除能源费用后的税额',
  },
  'tax-other-saving': {
    title: '其他运行成本所得税节省',
    formula: '扣除能源费用后的税额 − 最终所得税',
  },
  'tax-saving': {
    title: '年度所得税总节省',
    formula: '租赁前所得税 − 租赁后所得税',
  },
  'medicare-saving': {
    title: '年度 Medicare levy 节省',
    formula: '租赁前 Medicare − 租赁后 Medicare',
  },
  'gst-net': {
    title: '整个租赁期间的净 GST 收益',
    formula: '车辆抵免 +（运行抵免 + 管理费抵免 − 缴款 GST）× 年数 − 残值 GST',
  },
  'benefit-total': {
    title: '预计税务 + GST 总收益',
    formula: '年度所得税和 Medicare 节省 × 年数 + 净 GST 收益',
  },
  'total-out-of-pocket': {
    title: '自付总成本',
    formula: '年度到手工资减少 × 年数 + 最终残值 + 税后前期及结束费用',
  },
  'effective-monthly': {
    title: '车辆每月有效成本',
    formula: '自付总成本 ÷ 月数',
  },
  'take-home-before': {
    title: '不使用租赁时的到手工资',
    formula: '薪资 − 所得税 − Medicare',
  },
  'take-home-after': {
    title: '使用租赁后的到手工资',
    formula: '薪资 − 税前打包 − 税后缴款 − 所得税 − Medicare',
  },
  'take-home-annual': {
    title: '年度到手工资减少',
    formula: '不使用租赁时的到手工资 − 使用租赁后的到手工资',
  },
  'take-home-monthly': {
    title: '每月到手工资减少',
    formula: '年度到手工资减少 ÷ 12',
  },
};

export function translateSectionTitle(locale: Locale, section: CalculationSection): string {
  if (locale === 'en') return section.title;
  return sectionTranslations[section.id] ?? translateText(locale, section.title);
}

function translateBracketTitle(title: string): string {
  return title.replace(/\bto\b/g, '至').replace(/\band above\b/g, '及以上');
}

export function translateStep(locale: Locale, step: CalculationStep): CalculationStep {
  if (locale === 'en') return step;
  const copy = stepTranslations[step.id];
  let title = copy?.title ?? translateText(locale, step.title);
  if (step.id.startsWith('bracket-')) title = translateBracketTitle(step.title);
  if (step.id === 'energy-usage')
    title = step.title.includes('electricity') ? '年度用电量' : '年度燃油用量';
  if (step.id === 'energy-annual')
    title = step.title.includes('charging') ? '年度充电费用' : '年度燃油费用';
  if (step.id === 'energy-monthly')
    title = step.title.includes('charging') ? '每月充电费用' : '每月燃油费用';
  if (
    step.id.startsWith('running-') &&
    !['running-gross', 'running-net', 'running-monthly'].includes(step.id)
  ) {
    title = `${translateText(locale, step.title.replace(/ package budget$/, ''))}方案预算`;
  }
  return {
    ...step,
    title,
    description: translateText(locale, step.description),
    formula: copy?.formula ?? translateText(locale, step.formula),
    inputs: step.inputs.map((input) => ({
      ...input,
      label: translateText(locale, input.label),
    })),
    calculation: step.calculation
      .replace('Exempt vehicle →', '豁免车辆 →')
      .replace('No spouse levy allocation →', '无配偶 levy 分配 →')
      .replace(/\bno levy\b/g, '无 levy'),
  };
}

export function translateEligibilityStatus(locale: Locale, status: string): string {
  if (locale === 'en') return status;
  if (status === 'FBT-exempt EV') return 'FBT 豁免电动车';
  if (status === 'Contribution estimate') return '员工缴款估算';
  if (status === 'Likely FBT exempt') return '可能符合 FBT 豁免';
  if (status === 'Not FBT exempt') return '不符合 FBT 豁免';
  if (status === 'Unable to determine') return '无法确定';
  return status;
}

export function translateWarning(locale: Locale, warning: string): string {
  if (locale === 'en') return warning;
  const dynamicWarnings: Array<[string, string]> = [
    [
      'Projection holds FY2026–27 tax rules',
      '整个租赁期间固定采用 2026–27 财年税务规则、薪资、成本和 FBT 处理方式。未考虑未来减税、指数调整及法律变化。',
    ],
    [
      'GST car limit and credit cap',
      '车辆 GST 上限和抵免上限采用简要资料中的数值；请向服务商确认当前 ATO 门槛。',
    ],
    [
      'Insurance is treated as GST-bearing',
      '保险按含 GST 处理，但会扣除你输入的非 GST 金额。请查看保险发票中的税费和附加费。',
    ],
    [
      'This is an estimate, not a provider quote',
      '这是估算，不是服务商报价。雇主 GST 权利、租金抵免限制、残值成本基数和合资格费用需要确认。',
    ],
    [
      'HELP/HECS repayments are NOT included',
      '未包含 HELP/HECS 还款。即使电动车享受 FBT 豁免，应申报福利也可能增加还款收入，因此实际工资影响可能不同。',
    ],
    [
      'Medicare levy surcharge is NOT included',
      '未包含 Medicare levy surcharge。应申报福利可能影响 surcharge 收入；显示的标准 Medicare levy 另行计算。',
    ],
    [
      'PHEV running costs use a fuel-only approximation',
      'PHEV 运行成本采用仅燃油的近似值。混合充电和汽油使用需要定制预算。',
    ],
    [
      'The entered interest rate is outside the typical 7–12% range',
      '输入的利率不在通常的 7–12% 范围内，计算会按输入值使用。',
    ],
    [
      'The package exceeds available salary or take-home pay',
      '薪资打包金额超过可用薪资或到手工资。按当前输入，这个方案无法负担，服务商可能不会批准。',
    ],
    [
      'The statutory employee contribution exceeds the net package cost',
      '法定员工缴款超过净薪资打包成本。估算包含完整缴款且不计算退款；请向服务商索取定制报价。',
    ],
    [
      'For a qualifying sole-parent Medicare reduction',
      '如需适用符合条件的单亲家长 Medicare 减免，请选择家庭情况；单身状态使用个人 levy 门槛。',
    ],
  ];
  for (const [prefix, translation] of dynamicWarnings) {
    if (warning.startsWith(prefix)) return translation;
  }
  const colon = warning.indexOf(':');
  if (colon > 0 && warning.endsWith('not the exempt-EV treatment.')) {
    const explanation = warning
      .slice(colon + 1)
      .replace(
        / Results use a full-year statutory employee contribution estimate, not the exempt-EV treatment\.$/,
        '',
      )
      .trim();
    const explanationTranslations: Record<string, string> = {
      'Conventional petrol, diesel and non-plug-in hybrid cars do not qualify for the electric car exemption.':
        '传统汽油车、柴油车和非插电式混合动力车不符合电动车豁免条件。',
      'Luxury car tax has been payable on this car; the electric car exemption does not apply.':
        '这辆车曾需要缴纳豪华汽车税，因此不适用电动车豁免。',
      'The car was first held and used before 1 July 2022.':
        '这辆车在 2022 年 7 月 1 日之前首次被持有并使用。',
      'Confirm the first held-and-used date, lease start, vehicle value and whether luxury car tax has ever been payable. Purchase price alone cannot establish historical LCT liability.':
        '请确认首次持有并使用日期、租赁开始日期、车辆价值，以及是否曾需要缴纳豪华汽车税。仅凭购车价格无法确定历史 LCT 责任。',
      'First held-and-used date is after lease commencement. Confirm the expected delivery and commencement dates.':
        '首次持有并使用日期晚于租赁开始日期。请确认预计交付日期和租赁开始日期。',
      'A new PHEV commitment from 1 April 2025 does not qualify. Transitional existing agreements require separate advice and are not modelled.':
        '2025 年 4 月 1 日起的新 PHEV 承诺不符合条件。现有过渡协议需要单独咨询，本模型不予计算。',
      'An older PHEV agreement may qualify only under the transitional rules. Its binding commitment and prior exemption must be checked.':
        '较早的 PHEV 协议可能仅在过渡规则下符合条件，需要核实其具有约束力的承诺和此前的豁免资格。',
      'BEV first held and used on or after 1 July 2022, with no LCT ever payable as declared. Assumes an eligible passenger car provided to a current employee. Confirm with your employer; future law changes are not forecast.':
        '根据申报信息，BEV 在 2022 年 7 月 1 日或之后首次被持有并使用，且从未需要缴纳 LCT。假设车辆是提供给现任员工的合资格乘用车。请向雇主确认；本模型不预测未来法律变化。',
      'No current-law rule set is configured for the selected tax year.':
        '所选纳税年度未配置现行法律规则。',
    };
    const translatedExplanation = explanationTranslations[explanation] ?? explanation;
    return `${translateEligibilityStatus(locale, warning.slice(0, colon))}：${translatedExplanation} 结果采用全年法定员工缴款估算，而不是电动车豁免处理。`;
  }
  return warning;
}

export function translateValidationIssue(locale: Locale, issue: string): string {
  if (locale === 'en') return issue;
  const exact: Record<string, string> = {
    'Lease duration must be 1–5 whole years.': '租赁期限必须为 1–5 个完整年份。',
    'Vehicle efficiency must be greater than zero.': '车辆能效必须大于零。',
    'Non-GST insurance charges cannot exceed the insurance premium.':
      '非 GST 保险费用不能超过保险保费。',
    'Dependants must be a whole number.': '受抚养人数必须为整数。',
    'Interest must be no greater than 1,000% for a meaningful estimate.':
      '为了得到有意义的估算，利率不能超过 1,000%。',
  };
  if (exact[issue]) return exact[issue];
  const fieldMatch = issue.match(/^(.+) must be a finite, non-negative number\.$/);
  if (fieldMatch) return `${translateText(locale, fieldMatch[1])} 必须是有限的非负数字。`;
  const dateMatch = issue.match(/^(.+) must be a valid date\.$/);
  if (dateMatch) {
    const label = dateMatch[1] === 'firstHeldAndUsedDate' ? '首次持有并使用日期' : '租赁开始日期';
    return `${label}必须是有效日期。`;
  }
  return issue;
}
