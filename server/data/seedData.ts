import {
  CompetencyCode,
  CompetencyInfo,
  AssessmentQuestion,
  PublicResource,
} from '../types.ts';

export const COMPETENCIES_DATA: Record<CompetencyCode, CompetencyInfo> = {
  [CompetencyCode.PYTHON_BASICS]: {
    code: CompetencyCode.PYTHON_BASICS,
    name: 'Python Basics',
    description: 'Core syntax, variables, data structures (lists, dicts, sets), loops, functions, and error handling.',
    targetRoleRelevance: 'Essential foundation for scripting, data extraction, and running analytical pipelines in Junior Data Analyst roles.',
    searchQueries: ['Python programming fundamentals', 'Python for beginners', 'Python data structures'],
  },
  [CompetencyCode.DATA_HANDLING]: {
    code: CompetencyCode.DATA_HANDLING,
    name: 'Data Handling',
    description: 'Data cleaning, tabular manipulation with pandas, handling missing values, joins, merges, and reshaping.',
    targetRoleRelevance: 'Over 60% of daily data analyst duties involve sanitizing raw exports and aggregating data matrices.',
    searchQueries: ['data cleaning', 'data handling with Python', 'pandas data analysis'],
  },
  [CompetencyCode.STATISTICS]: {
    code: CompetencyCode.STATISTICS,
    name: 'Statistics',
    description: 'Descriptive metrics (mean, median, IQR, variance), probability fundamentals, distributions, and hypothesis testing.',
    targetRoleRelevance: 'Crucial to prevent misleading business inferences and evaluate experimental significance accurately.',
    searchQueries: ['descriptive statistics', 'statistics for data analysis', 'probability basics'],
  },
  [CompetencyCode.DATA_VISUALIZATION]: {
    code: CompetencyCode.DATA_VISUALIZATION,
    name: 'Data Visualization',
    description: 'Chart selection rules, visual grammar, encoding dimensions, storytelling, and avoiding chart junk.',
    targetRoleRelevance: 'Enables communicating actionable metrics clearly to non-technical stakeholders and executive teams.',
    searchQueries: ['data visualization', 'charts and graphs', 'visual analytics'],
  },
  [CompetencyCode.DATA_PRIVACY]: {
    code: CompetencyCode.DATA_PRIVACY,
    name: 'Data Privacy & Ethics',
    description: 'PII de-identification, GDPR/CCPA baseline compliance, anonymization, and ethical handling of user metrics.',
    targetRoleRelevance: 'Mandatory compliance safeguards preventing regulatory exposure and maintaining data governance integrity.',
    searchQueries: ['data privacy fundamentals', 'information security basics', 'responsible data use'],
  },
};

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // 1. PYTHON_BASICS (3 questions)
  {
    id: 'py-01',
    competencyCode: CompetencyCode.PYTHON_BASICS,
    question: 'In Python, what is the key behavioral difference between a list and a tuple?',
    options: [
      'Lists are mutable and can be modified after creation, whereas tuples are immutable.',
      'Tuples support string keys like dictionaries, while lists only accept integer indices.',
      'Lists cannot contain duplicate elements, whereas tuples preserve duplicates.',
      'Tuples can only store numeric values, while lists accept mixed data types.',
    ],
    correctOption: 0,
    explanation: 'Lists in Python are defined with square brackets and are mutable (items can be added, modified, or removed). Tuples are defined with parentheses and are immutable.',
    difficulty: 'beginner',
  },
  {
    id: 'py-02',
    competencyCode: CompetencyCode.PYTHON_BASICS,
    question: 'Given `numbers = [1, 2, 3, 4, 5]`, which list comprehension creates a list of squares for odd numbers only?',
    options: [
      '[x**2 for x in numbers if x % 2 != 0]',
      '[x**2 if x % 2 != 0 for x in numbers]',
      '[x*2 for x in numbers while x % 2 == 1]',
      '[for x in numbers: x**2 if x % 2 != 0]',
    ],
    correctOption: 0,
    explanation: 'The standard list comprehension syntax with an element filter is `[expression for item in iterable if condition]`.',
    difficulty: 'intermediate',
  },
  {
    id: 'py-03',
    competencyCode: CompetencyCode.PYTHON_BASICS,
    question: 'What occurs when querying a non-existent key from a dictionary using `my_dict.get("missing_key", 0)`?',
    options: [
      'It returns the fallback value 0 without raising a KeyError exception.',
      'It raises an unhandled KeyError unless wrapped in a try/except block.',
      'It mutates the dictionary by automatically inserting "missing_key": 0.',
      'It returns None and ignores the second parameter.',
    ],
    correctOption: 0,
    explanation: 'The `.get(key, default)` method safely accesses dictionary keys. If the key is absent, it returns the provided default value (0) instead of throwing a KeyError.',
    difficulty: 'beginner',
  },

  // 2. DATA_HANDLING (3 questions)
  {
    id: 'dh-01',
    competencyCode: CompetencyCode.DATA_HANDLING,
    question: 'When preprocessing a pandas DataFrame with right-skewed revenue data, why is imputing missing values with the median often preferred over the mean?',
    options: [
      'The median is robust to extreme outliers and does not skew the center of central tendency.',
      'The median always minimizes variance better than any parametric statistic.',
      'Pandas `.fillna()` executes significantly faster with medians than with means.',
      'The mean can only be computed on categorical columns, not continuous numbers.',
    ],
    correctOption: 0,
    explanation: 'The arithmetic mean is sensitive to heavy right-tail outliers, which inflate the imputed value. The median represents the 50th percentile and is robust against skewed outliers.',
    difficulty: 'intermediate',
  },
  {
    id: 'dh-02',
    competencyCode: CompetencyCode.DATA_HANDLING,
    question: 'What is the outcome of executing `df.drop_duplicates(subset=["customer_id"], keep="last")` in pandas?',
    options: [
      'It retains only the final occurrence of each duplicate customer_id and drops earlier ones.',
      'It deletes all rows that have duplicate customer_ids, keeping zero copies.',
      'It replaces duplicate customer_id records with NaN values across all columns.',
      'It sorts the DataFrame in descending order by customer_id without removing rows.',
    ],
    correctOption: 0,
    explanation: 'Setting `keep="last"` preserves the last entry for each duplicated subset key and eliminates prior duplicates.',
    difficulty: 'intermediate',
  },
  {
    id: 'dh-03',
    competencyCode: CompetencyCode.DATA_HANDLING,
    question: 'Which pandas operation combines two DataFrames while preserving all rows from the left table and matching records from the right table?',
    options: [
      'pd.merge(left_df, right_df, on="id", how="left")',
      'pd.merge(left_df, right_df, on="id", how="inner")',
      'pd.concat([left_df, right_df], axis=0, join="strict")',
      'left_df.join(right_df, how="cross")',
    ],
    correctOption: 0,
    explanation: 'A left outer join (`how="left"`) retains 100% of rows from the left DataFrame and fills unmatched attributes from the right DataFrame with NaN.',
    difficulty: 'beginner',
  },

  // 3. STATISTICS (3 questions)
  {
    id: 'stat-01',
    competencyCode: CompetencyCode.STATISTICS,
    question: 'A dataset has a mean of 50 and a standard deviation of 10. According to Chebyshev’s Theorem, what is the minimum proportion of data within 2 standard deviations (between 30 and 70)?',
    options: [
      'At least 75% (1 - 1/k² for k=2)',
      'Exactly 68.2% regardless of distribution shape',
      'At least 95.4% for arbitrary distributions',
      'At least 50.0% only if data is multimodal',
    ],
    correctOption: 0,
    explanation: 'Chebyshev’s Theorem states that for ANY distribution, the proportion of data within k standard deviations is at least 1 - 1/k². For k=2, 1 - 1/4 = 0.75 (75%).',
    difficulty: 'intermediate',
  },
  {
    id: 'stat-02',
    competencyCode: CompetencyCode.STATISTICS,
    question: 'In hypothesis testing, what does a p-value of 0.03 indicate when testing at a significance threshold (alpha) of 0.05?',
    options: [
      'There is statistically significant evidence to reject the null hypothesis because p < 0.05.',
      'The null hypothesis is proven to be 97% true beyond any doubt.',
      'The test results are inconclusive because the p-value must be exactly 0.000.',
      'We fail to reject the null hypothesis because the alpha level was not reached.',
    ],
    correctOption: 0,
    explanation: 'When the observed p-value (0.03) is less than the predetermined significance level alpha (0.05), we reject the null hypothesis in favor of the alternative hypothesis.',
    difficulty: 'intermediate',
  },
  {
    id: 'stat-03',
    competencyCode: CompetencyCode.STATISTICS,
    question: 'What is the relationship between the interquartile range (IQR) and extreme values in a distribution?',
    options: [
      'IQR measures the spread of the middle 50% (Q3 - Q1) and is resilient against extreme outliers.',
      'IQR is calculated as (Max - Min) / 2 and is heavily distorted by extreme values.',
      'IQR only applies to continuous Gaussian distributions and cannot be used with outliers.',
      'IQR is always equal to twice the sample standard deviation.',
    ],
    correctOption: 0,
    explanation: 'The Interquartile Range (IQR = Q3 - Q1) measures the dispersion of the central half of ranked observations and remains stable even in the presence of severe outliers.',
    difficulty: 'beginner',
  },

  // 4. DATA_VISUALIZATION (3 questions)
  {
    id: 'vis-01',
    competencyCode: CompetencyCode.DATA_VISUALIZATION,
    question: 'Which chart type is most appropriate for examining the relationship and potential correlation between two continuous numeric variables?',
    options: [
      'A scatter plot with optional trend/regression line.',
      'A stacked 100% bar chart with ordinal categories.',
      'A donut chart displaying proportional slices.',
      'A radar polygon chart comparing categorical profiles.',
    ],
    correctOption: 0,
    explanation: 'Scatter plots map two continuous variables onto Cartesian (X, Y) coordinates, making bivariate patterns, clustering, and correlation readily discernible.',
    difficulty: 'beginner',
  },
  {
    id: 'vis-02',
    competencyCode: CompetencyCode.DATA_VISUALIZATION,
    question: 'Why is truncating the Y-axis baseline to a non-zero value on a standard bar chart considered bad practice in data communication?',
    options: [
      'It visually exaggerates differences between bars because bar lengths encode magnitudes proportionally.',
      'It causes SVG rendering artifacts across modern web browsers.',
      'It prevents viewers from reading the category labels on the horizontal axis.',
      'It converts bar charts into histograms automatically.',
    ],
    correctOption: 0,
    explanation: 'In bar charts, the visual length of each bar encodes numeric quantity. Truncating the baseline distorts the ratio between bars, misleading the viewer regarding relative differences.',
    difficulty: 'intermediate',
  },
  {
    id: 'vis-03',
    competencyCode: CompetencyCode.DATA_VISUALIZATION,
    question: 'When designing a dashboard for executive decision-makers, what does Edward Tufte’s "data-ink ratio" principle recommend?',
    options: [
      'Maximize the share of graphic ink dedicated to displaying actual data while removing redundant decorative gridlines and 3D effects.',
      'Use as many vibrant color palettes as possible to distinguish every individual data point.',
      'Ensure every chart card includes shaded 3D borders and dark drop shadows for visual realism.',
      'Limit every dashboard to exactly one chart regardless of the underlying analytical questions.',
    ],
    correctOption: 0,
    explanation: 'Tufte’s data-ink ratio states that good graphical design maximizes the proportion of ink used to convey new information, while eliminating non-essential decorations ("chartjunk").',
    difficulty: 'intermediate',
  },

  // 5. DATA_PRIVACY (3 questions)
  {
    id: 'priv-01',
    competencyCode: CompetencyCode.DATA_PRIVACY,
    question: 'What is the primary difference between pseudonymous data and truly anonymous data under global privacy frameworks like GDPR?',
    options: [
      'Pseudonymous data can still be re-linked to an individual using separate key data, whereas anonymous data cannot reasonably identify an individual.',
      'Pseudonymous data is exempt from all privacy laws, while anonymous data is strictly regulated.',
      'Pseudonymization requires deleting all numerical columns from the dataset.',
      'There is no legal difference; both terms mean the exact same thing.',
    ],
    correctOption: 0,
    explanation: 'Pseudonymized data replaces direct identifiers with tokens/hashes, but can be re-identified with an auxiliary key, so it remains personal data. Anonymized data cannot be re-linked and falls outside GDPR scope.',
    difficulty: 'intermediate',
  },
  {
    id: 'priv-02',
    competencyCode: CompetencyCode.DATA_PRIVACY,
    question: 'Under data protection standards, which category represents Personally Identifiable Information (PII) that requires explicit handling controls?',
    options: [
      'Full names combined with personal email addresses and social identification numbers.',
      'Aggregated city-level average temperatures for the past five years.',
      'Anonymized summary counts of website visits grouped by browser user-agent.',
      'Publicly listed stock market closing prices.',
    ],
    correctOption: 0,
    explanation: 'PII encompasses any information that can directly or indirectly distinguish an individual identity, such as names, social identification numbers, and contact records.',
    difficulty: 'beginner',
  },
  {
    id: 'priv-03',
    competencyCode: CompetencyCode.DATA_PRIVACY,
    question: 'In the context of statistical disclosure limitation, what protection does the "k-anonymity" guarantee provide to individuals in a shared dataset?',
    options: [
      'Each individual’s quasi-identifier combination (e.g. Age, Gender, Postal Code) cannot be distinguished from at least k-1 other individuals.',
      'The dataset is encrypted with a k-bit symmetric AES key before storage.',
      'The database restricts access to exactly k authenticated users at any given time.',
      'It ensures that at least k% of all database records are permanently deleted every month.',
    ],
    correctOption: 0,
    explanation: 'A release of data is said to have the k-anonymity property if the information for each person contained in the release cannot be distinguished from at least k-1 other individuals whose information also appears in the release.',
    difficulty: 'intermediate',
  },
];

export const SEEDED_PUBLIC_RESOURCES: PublicResource[] = [
  // STATISTICS
  {
    external_id: 'oer-stat-101',
    title: 'Introductory Statistics for Data Analysts',
    description: 'Comprehensive open textbook covering descriptive metrics, probability distributions, normal curve theory, hypothesis testing, and regression analysis.',
    provider: 'OpenStax / OER Commons',
    provider_type: 'oer_commons',
    resource_url: 'https://openstax.org/details/books/introductory-statistics',
    resource_type: 'Textbook',
    competencies: [CompetencyCode.STATISTICS, CompetencyCode.DATA_HANDLING],
    level: 'Beginner',
    language: 'English',
    duration_minutes: 360,
    license_name: 'CC BY 4.0',
    license_url: 'https://creativecommons.org/licenses/by/4.0/',
    requires_login: false,
    country_scope: 'Global',
    source_metadata_url: 'https://www.oercommons.org/courses/introductory-statistics-openstax',
    isFallback: true,
  },
  {
    external_id: 'oer-stat-201',
    title: 'Descriptive Statistics & Exploratory Data Analysis',
    description: 'Modular interactive course on central tendency, dispersion metrics, IQR outlier bounds, variance, and interpreting distributions for business intelligence.',
    provider: 'MIT OpenCourseWare',
    provider_type: 'mit_ocw',
    resource_url: 'https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2014/',
    resource_type: 'Course',
    competencies: [CompetencyCode.STATISTICS],
    level: 'Developing',
    language: 'English',
    duration_minutes: 240,
    license_name: 'CC BY-NC-SA 4.0',
    license_url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    requires_login: false,
    country_scope: 'Global',
    source_metadata_url: 'https://ocw.mit.edu/',
    isFallback: true,
  },
  {
    external_id: 'oer-stat-301',
    title: 'Practical Probability and Inferential Statistics Lab',
    description: 'Hands-on problem sets and Python notebooks exploring sampling distributions, central limit theorem simulations, and confidence intervals.',
    provider: 'OER Commons',
    provider_type: 'oer_commons',
    resource_url: 'https://www.oercommons.org/curated-collections/521',
    resource_type: 'Lab / Exercise',
    competencies: [CompetencyCode.STATISTICS, CompetencyCode.PYTHON_BASICS],
    level: 'Developing',
    language: 'English',
    duration_minutes: 180,
    license_name: 'CC BY 3.0',
    license_url: 'https://creativecommons.org/licenses/by/3.0/',
    requires_login: false,
    country_scope: 'Global',
    source_metadata_url: 'https://www.oercommons.org/',
    isFallback: true,
  },

  // DATA_VISUALIZATION
  {
    external_id: 'oer-vis-101',
    title: 'Visual Storytelling and Exploratory Analytics',
    description: 'Principles of visual encoding, chart taxonomy, cognitive load reduction, effective color palettes, and avoiding deceptive graphs.',
    provider: 'OER Commons Curated',
    provider_type: 'oer_commons',
    resource_url: 'https://www.oercommons.org/browse?f.general_subject=information-science',
    resource_type: 'Interactive Module',
    competencies: [CompetencyCode.DATA_VISUALIZATION],
    level: 'Beginner',
    language: 'English',
    duration_minutes: 150,
    license_name: 'CC BY 4.0',
    license_url: 'https://creativecommons.org/licenses/by/4.0/',
    requires_login: false,
    country_scope: 'Global',
    source_metadata_url: 'https://www.oercommons.org/',
    isFallback: true,
  },
  {
    external_id: 'oer-vis-201',
    title: 'Data Visualization with Matplotlib, Seaborn & Plotly',
    description: 'Practical guides to crafting publication-quality scatter plots, box plots, heatmaps, faceted grids, and responsive charts in Python.',
    provider: 'Open Textbook Library',
    provider_type: 'local_catalogue',
    resource_url: 'https://open.umn.edu/opentextbooks/textbooks/data-visualization-principles',
    resource_type: 'Course',
    competencies: [CompetencyCode.DATA_VISUALIZATION, CompetencyCode.PYTHON_BASICS],
    level: 'Developing',
    language: 'English',
    duration_minutes: 210,
    license_name: 'CC BY-SA 4.0',
    license_url: 'https://creativecommons.org/licenses/by-sa/4.0/',
    requires_login: false,
    country_scope: 'Global',
    source_metadata_url: 'https://open.umn.edu/',
    isFallback: true,
  },
  {
    external_id: 'oer-vis-301',
    title: 'Executive Dashboard Design Principles',
    description: 'Framework for designing clear analytical dashboards with high data-ink ratios, KPI summaries, and structured drill-down hierarchies.',
    provider: 'OER Commons',
    provider_type: 'oer_commons',
    resource_url: 'https://www.oercommons.org/curated-collections/412',
    resource_type: 'Interactive Module',
    competencies: [CompetencyCode.DATA_VISUALIZATION, CompetencyCode.DATA_HANDLING],
    level: 'Developing',
    language: 'English',
    duration_minutes: 120,
    license_name: 'CC BY-NC 4.0',
    license_url: 'https://creativecommons.org/licenses/by-nc/4.0/',
    requires_login: false,
    country_scope: 'Global',
    source_metadata_url: 'https://www.oercommons.org/',
    isFallback: true,
  },

  // DATA_HANDLING
  {
    external_id: 'oer-dh-101',
    title: 'Data Cleaning and Wrangling with Python & Pandas',
    description: 'Master the art of handling messy real-world datasets: missing value imputation, string parsing, type casting, merging tables, and group aggregations.',
    provider: 'OER Commons / Software Carpentry',
    provider_type: 'oer_commons',
    resource_url: 'https://swcarpentry.github.io/python-novice-gapminder/',
    resource_type: 'Lab / Exercise',
    competencies: [CompetencyCode.DATA_HANDLING, CompetencyCode.PYTHON_BASICS],
    level: 'Beginner',
    language: 'English',
    duration_minutes: 240,
    license_name: 'CC BY 4.0',
    license_url: 'https://creativecommons.org/licenses/by/4.0/',
    requires_login: false,
    country_scope: 'Global',
    source_metadata_url: 'https://swcarpentry.github.io/',
    isFallback: true,
  },
  {
    external_id: 'oer-dh-201',
    title: 'Tabular Data Transformation and Reshaping Patterns',
    description: 'In-depth guide to pivoting, melting, multi-indexing, categorical encoding, and performance optimization for pandas operations.',
    provider: 'Open Educational Network',
    provider_type: 'local_catalogue',
    resource_url: 'https://www.oercommons.org/courses/data-analysis-and-wrangling',
    resource_type: 'Course',
    competencies: [CompetencyCode.DATA_HANDLING],
    level: 'Developing',
    language: 'English',
    duration_minutes: 190,
    license_name: 'CC BY 3.0',
    license_url: 'https://creativecommons.org/licenses/by/3.0/',
    requires_login: false,
    country_scope: 'Global',
    source_metadata_url: 'https://www.oercommons.org/',
    isFallback: true,
  },

  // PYTHON_BASICS
  {
    external_id: 'oer-py-101',
    title: 'Python for Everybody: Exploring Data',
    description: 'Dr. Charles Severance’s internationally acclaimed open course on Python syntax, data structures, files, web scraping, and databases.',
    provider: 'OER Commons / University of Michigan',
    provider_type: 'oer_commons',
    resource_url: 'https://www.py4e.com/book',
    resource_type: 'Textbook',
    competencies: [CompetencyCode.PYTHON_BASICS],
    level: 'Beginner',
    language: 'English',
    duration_minutes: 300,
    license_name: 'CC BY-NC-SA 3.0',
    license_url: 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
    requires_login: false,
    country_scope: 'Global',
    source_metadata_url: 'https://www.py4e.com/',
    isFallback: true,
  },
  {
    external_id: 'oer-py-201',
    title: 'Scientific Computing with Python',
    description: 'Foundations of numerical computing, vectorization, array manipulation, and functional programming constructs in Python.',
    provider: 'MIT OpenCourseWare',
    provider_type: 'mit_ocw',
    resource_url: 'https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/',
    resource_type: 'Course',
    competencies: [CompetencyCode.PYTHON_BASICS],
    level: 'Developing',
    language: 'English',
    duration_minutes: 320,
    license_name: 'CC BY-NC-SA 4.0',
    license_url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    requires_login: false,
    country_scope: 'Global',
    source_metadata_url: 'https://ocw.mit.edu/',
    isFallback: true,
  },

  // DATA_PRIVACY
  {
    external_id: 'oer-priv-101',
    title: 'Data Privacy and Ethics for Analysts',
    description: 'Legal standards and best practices for managing personal information, de-identification techniques, anonymization, and GDPR principles.',
    provider: 'OER Commons Open Courseware',
    provider_type: 'oer_commons',
    resource_url: 'https://www.oercommons.org/courses/data-ethics-and-society',
    resource_type: 'Course',
    competencies: [CompetencyCode.DATA_PRIVACY],
    level: 'Developing',
    language: 'English',
    duration_minutes: 180,
    license_name: 'CC BY 4.0',
    license_url: 'https://creativecommons.org/licenses/by/4.0/',
    requires_login: false,
    country_scope: 'Global',
    source_metadata_url: 'https://www.oercommons.org/',
    isFallback: true,
  },
  {
    external_id: 'oer-priv-201',
    title: 'Foundations of Information Security & Responsible Data Use',
    description: 'An analyst-focused guide on access governance, cryptographic hashing, anonymizing sensitive identifiers, and complying with data retention policies.',
    provider: 'Open Education Consortium',
    provider_type: 'local_catalogue',
    resource_url: 'https://www.oercommons.org/courses/information-security-fundamentals',
    resource_type: 'Textbook',
    competencies: [CompetencyCode.DATA_PRIVACY],
    level: 'Beginner',
    language: 'English',
    duration_minutes: 160,
    license_name: 'CC BY-SA 4.0',
    license_url: 'https://creativecommons.org/licenses/by-sa/4.0/',
    requires_login: false,
    country_scope: 'Global',
    source_metadata_url: 'https://www.oercommons.org/',
    isFallback: true,
  },
];

export const SAMPLE_LEARNING_DOCUMENT = {
  title: 'Practical Statistics and Visual Analytics for Junior Data Analysts.pdf',
  pages: [
    {
      pageNumber: 1,
      text: `Practical Statistics and Visual Analytics for Junior Data Analysts
Chapter 1: Descriptive Statistics and Robust Central Tendency

In analytical workflows, choosing appropriate summary statistics is the first defense against misleading conclusions. The arithmetic mean is the mathematical average of all observations. However, because it incorporates every value linearly, the mean is exceptionally vulnerable to extreme values or heavy right-skewed tails, such as executive salaries, customer lifetime values, or server response latencies.

When data displays significant skewness, the median—representing the 50th percentile or midpoint of sorted values—provides a substantially more robust estimate of central location. The median divides the ranked observations such that exactly 50% fall below and 50% fall above it. In asymmetric distributions, calculating both the mean and median highlights the direction of skew: if the mean is markedly greater than the median, the distribution is right-skewed (positive skew).

To quantify dispersion, standard deviation measures the average squared distance from the mean, but like the mean, it is heavily distorted by outliers. In contrast, the Interquartile Range (IQR) measures the statistical spread between the first quartile (25th percentile, Q1) and the third quartile (75th percentile, Q3), effectively capturing the span of the middle 50% of records. John Tukey established the standard outlier criterion where any observation falling below Q1 - 1.5 * IQR or above Q3 + 1.5 * IQR is categorized as a statistical outlier.`
    },
    {
      pageNumber: 2,
      text: `Chapter 2: Hypothesis Testing, P-Values, and Avoiding Pitfalls

Hypothesis testing provides a mathematical framework for deciding whether empirical observations reflect genuine systemic effects or mere random sampling fluctuation. The procedure begins by establishing a Null Hypothesis (H0), which posits that no effect, difference, or relationship exists in the population, alongside an Alternative Hypothesis (H1).

The test calculates a test statistic and derives a p-value: the probability of obtaining test results at least as extreme as the observed data, assuming that the null hypothesis is true. A significance threshold (alpha), traditionally calibrated at 0.05 (5%), establishes the acceptable risk of committing a Type I error (falsely rejecting a true null hypothesis). If the calculated p-value is strictly less than alpha (p < 0.05), researchers reject the null hypothesis in favor of the alternative hypothesis.

Crucially, junior analysts must avoid the common fallacy that a p-value measures the probability that the hypothesis itself is correct, or that statistical significance equates to practical business impact. Even trivial, practically meaningless differences will produce tiny p-values when evaluated on massive sample sizes. Furthermore, correlation does not establish causation; confounding variables and reverse causality can generate strong statistical associations without direct causal links.`
    },
    {
      pageNumber: 3,
      text: `Chapter 3: Visual Analytics, Chart Selection, and Graphical Integrity

Data visualization is not decorative art; it is cognitive compression. Effective visual design honors the cognitive capabilities of human visual perception. Edward Tufte introduced the fundamental metric known as the "data-ink ratio", defined as the proportion of graphical ink devoted to non-redundant display of data information. Higher data-ink ratios—achieved by eliminating heavy background textures, 3D perspectives, unnecessary borders, and non-semantic color variation—consistently improve reading comprehension speed.

Chart selection must be dictated strictly by the underlying dimensionality and relationships of the data:
1. Bivariate Correlation: Use scatter plots with continuous X and Y coordinates to reveal linear associations, non-linear curvature, and clustering.
2. Part-to-Whole Comparisons: Bar charts or stacked bar charts with a zero-aligned baseline are far superior to pie charts because human perception judges linear length significantly more accurately than angular area.
3. Distribution Profiling: Box plots and histograms illustrate median alignment, IQR spread, and outlier locations simultaneously.

A cardinal rule of graphical integrity is that bar charts MUST always start their value axis at zero. Truncating the vertical baseline distorts the visual ratio between bars, causing a 5% difference to appear visually as a 500% change, thus actively deceiving stakeholders.`
    },
    {
      pageNumber: 4,
      text: `Chapter 4: Data Sanitization, Handling Missingness, and Privacy Guardrails

Prior to conducting statistical tests or rendering visual charts, data must undergo rigorous hygiene. Missing values generally fall into three distinct mechanisms: Missing Completely at Random (MCAR), Missing at Random (MAR), and Missing Not at Random (MNAR). For skewed numerical variables, imputing with median values preserves stability without artificially inflating variance.

Simultaneously, analysts have a professional and legal duty to protect user privacy under frameworks such as GDPR and CCPA. Personally Identifiable Information (PII) includes any direct or indirect attributes that can identify a specific living human being. Analysts should employ de-identification pipelines:
- Hashing direct identifiers (such as user email addresses or government IDs) using cryptographic salts.
- Enforcing k-anonymity across quasi-identifiers (such as age, zip code, and gender) so that every individual's record is mathematically indistinguishable from at least k-1 other individuals in the release.
- Aggregating micro-level transaction logs into cohort summaries before sharing dashboards with external or cross-departmental teams.`
    }
  ]
};
