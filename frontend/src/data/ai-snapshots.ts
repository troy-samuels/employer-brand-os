/**
 * @module data/ai-snapshots
 * Pre-computed AI response snapshots for the "What AI Says About You" page.
 * Each entry contains responses from multiple AI models about a specific employer.
 * Updated periodically via audit pipeline.
 */

export interface AISnapshot {
  company: string;
  domain: string;
  slug: string;
  industry: string;
  employees: string;
  snapshotDate: string;
  responses: {
    model: string;
    modelIcon: string;
    response: string;
    sourcesCount: number;
    sentiment: "positive" | "mixed" | "negative";
    issues: string[];
  }[];
  overallScore: number;
  keyIssues: string[];
}

export const aiSnapshots: AISnapshot[] = [
  {
    company: "Revolut",
    domain: "revolut.com",
    slug: "revolut",
    industry: "Fintech",
    employees: "8,000+",
    snapshotDate: "2026-02-12",
    responses: [
      {
        model: "ChatGPT",
        modelIcon: "🟢",
        response:
          "Revolut is known for its fast-paced, high-pressure work environment. Employees often describe the culture as intense and demanding, with long hours expected. The company offers competitive salaries, particularly in engineering and product roles, though some employees report that compensation doesn't always match the workload. Benefits include stock options and the ability to work across global offices. Work-life balance is frequently cited as a concern, with many reviews mentioning burnout. However, employees praise the learning opportunities and the chance to work on cutting-edge fintech products. The company has grown rapidly, which creates both exciting opportunities and organisational chaos.",
        sourcesCount: 4,
        sentiment: "mixed",
        issues: [
          "No specific salary figures cited",
          "Culture description may be outdated",
          "No mention of UK-specific benefits",
        ],
      },
      {
        model: "Perplexity",
        modelIcon: "🔵",
        response:
          "Working at Revolut is frequently described as a demanding but rewarding experience. According to Glassdoor reviews (3.4/5 rating), employees highlight the steep learning curve and exposure to global fintech operations. However, Blind and Reddit discussions often paint a more critical picture, citing management issues and a 'move fast, break things' culture. Salary ranges from £45K-80K for mid-level roles and £100K+ for senior engineers. The company has faced criticism for high turnover rates. On the positive side, employees value the product innovation and international team diversity.",
        sourcesCount: 6,
        sentiment: "mixed",
        issues: [
          "Salary data may be outdated",
          "Cites anonymous review platforms",
          "Glassdoor rating not verified as current",
        ],
      },
      {
        model: "Gemini",
        modelIcon: "🟣",
        response:
          "Revolut offers a dynamic and fast-paced work environment typical of high-growth fintech companies. The culture is often described as intense, with high expectations and a focus on rapid execution. Work-life balance can be challenging, particularly during product launches. Compensation is generally competitive for the UK fintech market, with engineering salaries ranging from £50K to £120K depending on seniority. Stock options are available. Employee reviews highlight strong learning opportunities but also mention management inconsistencies and high pressure. The company has invested in improving culture following earlier criticism.",
        sourcesCount: 3,
        sentiment: "mixed",
        issues: [
          "Salary range is very broad",
          "No specific citation for 'improving culture' claim",
          "Missing information on remote work policy",
        ],
      },
    ],
    overallScore: 42,
    keyIssues: [
      "Inconsistent salary data across models",
      "Culture narrative dominated by old negative reviews",
      "No official employer data feeding AI models",
      "Missing: remote policy, parental leave, DEI initiatives",
    ],
  },
  {
    company: "Monzo",
    domain: "monzo.com",
    slug: "monzo",
    industry: "Fintech",
    employees: "3,000+",
    snapshotDate: "2026-02-12",
    responses: [
      {
        model: "ChatGPT",
        modelIcon: "🟢",
        response:
          "Monzo is widely regarded as one of the better places to work in UK fintech. The culture emphasises transparency, with internal communication being notably open. Employees appreciate the mission-driven environment and inclusive culture. Work-life balance is generally good compared to peers. Salaries are competitive but not the highest in the sector, with engineering roles typically ranging from £55K-95K. The company offers good benefits including mental health support and flexible working. Some concerns include slower career progression and the challenges of scaling a startup culture.",
        sourcesCount: 3,
        sentiment: "positive",
        issues: [
          "Salary ranges not well-sourced",
          "May conflate historical and current culture",
        ],
      },
      {
        model: "Perplexity",
        modelIcon: "🔵",
        response:
          "Monzo is highly rated on Glassdoor (4.1/5) and is known for its transparent, inclusive workplace culture. According to employee reviews, the company offers a supportive environment with genuine commitment to diversity and mental health. Salaries range from £50K-£100K for technical roles, with equity available. Work-life balance is praised, though some report challenges during critical product periods. The company has won multiple 'Best Places to Work' awards in the UK fintech space. Recent criticisms include concerns about profitability pressure affecting team morale.",
        sourcesCount: 5,
        sentiment: "positive",
        issues: [
          "'Best Places to Work' awards not verified",
          "Profitability pressure claim not sourced",
        ],
      },
      {
        model: "Gemini",
        modelIcon: "🟣",
        response:
          "Monzo is frequently cited as a positive workplace in UK banking. The company culture emphasises transparency and open communication, with regular all-hands meetings. Employee satisfaction is generally high. Compensation is competitive with mid-market salaries plus equity. The company offers remote and hybrid working options. Benefits include mental health days and a supportive management culture. Some employees note that rapid growth has led to growing pains in processes and career development pathways.",
        sourcesCount: 3,
        sentiment: "positive",
        issues: [
          "No specific salary figures",
          "'Competitive' is vague",
          "Remote policy details missing",
        ],
      },
    ],
    overallScore: 68,
    keyIssues: [
      "Generally positive but vague on specifics",
      "Salary data inconsistent across models",
      "No verified company-provided data in AI responses",
      "Could improve with structured employer content",
    ],
  },
  {
    company: "Deliveroo",
    domain: "deliveroo.co.uk",
    slug: "deliveroo",
    industry: "Food Tech",
    employees: "2,500+",
    snapshotDate: "2026-02-12",
    responses: [
      {
        model: "ChatGPT",
        modelIcon: "🟢",
        response:
          "Deliveroo has a mixed reputation as an employer. For corporate roles, the environment is described as innovative and fast-paced with competitive salaries. Engineering roles reportedly pay £60K-110K. However, much of the public discussion centres around rider working conditions and the gig economy model, which dominates the narrative. Corporate employees generally rate the experience positively, citing good benefits, a modern office in London, and strong team culture. Stock options are available for corporate staff. Work-life balance varies by team.",
        sourcesCount: 4,
        sentiment: "mixed",
        issues: [
          "Conflates rider and corporate employee experience",
          "Salary data specificity uncertain",
          "Gig economy controversy dominates AI narrative",
        ],
      },
      {
        model: "Perplexity",
        modelIcon: "🔵",
        response:
          "Deliveroo's reputation as an employer is split between its corporate workforce and its rider network. Glassdoor shows a 3.6/5 rating for corporate roles. However, news coverage overwhelmingly focuses on rider pay disputes, Supreme Court rulings on worker status, and union campaigns. Corporate employees report competitive compensation, good London offices, and meaningful work. But candidates researching Deliveroo will encounter significant negative press about worker treatment, which may deter applications even for corporate roles.",
        sourcesCount: 7,
        sentiment: "mixed",
        issues: [
          "News coverage bias towards rider controversy",
          "Glassdoor rating mixes rider and corporate reviews",
          "Supreme Court ruling reference may be outdated",
        ],
      },
      {
        model: "Gemini",
        modelIcon: "🟣",
        response:
          "Working at Deliveroo depends heavily on the role. Corporate employees in engineering, product, and marketing describe a stimulating environment with strong tech culture. The company offers competitive salaries, equity, and flexible working. However, Deliveroo has faced significant public scrutiny over its treatment of delivery riders, including legal challenges about employment status. This negative press can overshadow the positive aspects of corporate employment. Office culture is described as collaborative, with a focus on innovation in food and logistics technology.",
        sourcesCount: 4,
        sentiment: "mixed",
        issues: [
          "Rider vs corporate narrative is confused",
          "No specific salary figures",
          "Legal challenges may be resolved but still cited",
        ],
      },
    ],
    overallScore: 35,
    keyIssues: [
      "AI cannot distinguish between rider and corporate experience",
      "Negative press about riders dominates all AI responses",
      "Company has no structured data correcting the narrative",
      "Legal references may be outdated",
      "Huge opportunity to improve with employer-specific content",
    ],
  },
  {
    company: "Wise",
    domain: "wise.com",
    slug: "wise",
    industry: "Fintech",
    employees: "5,500+",
    snapshotDate: "2026-02-12",
    responses: [
      {
        model: "ChatGPT",
        modelIcon: "🟢",
        response:
          "Wise (formerly TransferWise) is generally well-regarded as an employer. The company is known for radical transparency, including publicly shared salary data and an open salary formula. Culture is described as autonomous and mission-driven, with a focus on keeping things simple. Salaries are fair but not top-of-market, as the company values keeping costs low. Benefits include stock options, which have been valuable given the company's strong performance since going public. Work-life balance is generally good, with flexible and remote working options.",
        sourcesCount: 3,
        sentiment: "positive",
        issues: [
          "Open salary claim not verified against current practice",
          "Stock option value depends on market conditions",
        ],
      },
      {
        model: "Perplexity",
        modelIcon: "🔵",
        response:
          "Wise has a strong employer brand, rated 4.2/5 on Glassdoor. The company is known for its unique autonomous culture and transparent salary formula. Employees highlight the mission-driven environment and the freedom to work independently. Salaries are pegged to a public formula based on role and location — typically mid-market but supplemented with equity. The company has offices in London, Tallinn, and other cities but supports remote work. Recent employee reviews mention some growing pains as the company scales beyond startup culture.",
        sourcesCount: 5,
        sentiment: "positive",
        issues: [
          "Salary formula may have changed since IPO",
          "Growing pains narrative is vague",
        ],
      },
      {
        model: "Gemini",
        modelIcon: "🟣",
        response:
          "Wise offers a distinctive workplace experience built around autonomy and transparency. The company uses an open salary formula and encourages independent decision-making. The culture is described as flat and collaborative, with minimal bureaucracy. Compensation is mid-market with strong equity packages. The London office is well-regarded, and remote work is supported. Employee satisfaction is generally high, with the mission of making international money transfers affordable resonating strongly with staff. Some employees note that the emphasis on frugality can sometimes feel limiting.",
        sourcesCount: 3,
        sentiment: "positive",
        issues: [
          "Frugality concern may be outdated",
          "No specific salary ranges given",
        ],
      },
    ],
    overallScore: 72,
    keyIssues: [
      "Generally accurate but lacks specificity",
      "Open salary formula is well-known but AI doesn't cite current numbers",
      "Could provide even richer data with structured employer content",
    ],
  },
  {
    company: "Darktrace",
    domain: "darktrace.com",
    slug: "darktrace",
    industry: "Cybersecurity",
    employees: "2,200+",
    snapshotDate: "2026-02-12",
    responses: [
      {
        model: "ChatGPT",
        modelIcon: "🟢",
        response:
          "Darktrace is a Cambridge-based cybersecurity company with a mixed employer reputation. The company offers exposure to cutting-edge AI technology and has grown rapidly. However, employee reviews frequently mention a high-pressure sales culture, particularly in commercial roles. Engineering roles are better received, with competitive salaries (£50K-90K) and interesting technical challenges. The company has faced scrutiny from short-sellers questioning its technology, which has affected morale at times. Management reviews are polarised. Benefits are reasonable but not standout.",
        sourcesCount: 4,
        sentiment: "mixed",
        issues: [
          "Short-seller controversy may be resolved but still cited",
          "Sales culture criticism may not apply to all roles",
          "Salary data not well-sourced",
        ],
      },
      {
        model: "Perplexity",
        modelIcon: "🔵",
        response:
          "Darktrace has a Glassdoor rating of 3.3/5. Employee reviews highlight good technology exposure but criticise the sales-driven culture. The company has been in the news for short-seller attacks and questions about its AI claims. Engineering salaries range from £45K-95K. The Cambridge headquarters and London office are praised, but reviews mention intense targets and high turnover in sales teams. The company was acquired by Thoma Bravo in 2024, which may have changed conditions.",
        sourcesCount: 6,
        sentiment: "negative",
        issues: [
          "Short-seller narrative dominates",
          "Acquisition impact not assessed",
          "Glassdoor rating mixes all roles",
          "Perplexity specifically cites negative sources",
        ],
      },
      {
        model: "Gemini",
        modelIcon: "🟣",
        response:
          "Darktrace offers roles in a cutting-edge cybersecurity environment based in Cambridge. The company has experienced rapid growth and provides exposure to AI-driven security technology. However, the work culture has received mixed reviews, with sales roles noted for high pressure and targets. Technical roles are more positively reviewed. Compensation is competitive for the Cambridge market. The company went through significant change with its acquisition by private equity firm Thoma Bravo.",
        sourcesCount: 3,
        sentiment: "mixed",
        issues: [
          "Very generic assessment",
          "Missing specifics on benefits, remote policy",
          "Acquisition framing could be more balanced",
        ],
      },
    ],
    overallScore: 29,
    keyIssues: [
      "AI narrative dominated by short-seller controversy and sales culture criticism",
      "Acquisition has likely changed conditions but AI still cites old data",
      "No structured employer data available to AI models",
      "Perplexity specifically surfaces negative sources",
      "Urgent need for AI reputation management",
    ],
  },
  {
    company: "Arm",
    domain: "arm.com",
    slug: "arm",
    industry: "Semiconductor",
    employees: "7,500+",
    snapshotDate: "2026-02-12",
    responses: [
      {
        model: "ChatGPT",
        modelIcon: "🟢",
        response:
          "Arm is widely considered one of the best tech employers in the UK, particularly in Cambridge. The company designs processor architectures used in most smartphones globally, giving employees a strong sense of impact. Culture is described as collaborative, technically rigorous, and open. Work-life balance is highly rated, with flexible working arrangements and a supportive management culture. Engineering salaries range from £50K-120K depending on seniority, with additional stock options following the company's IPO. Benefits include generous pension contributions and private healthcare. Some employees note that pay, while good for Cambridge, is not always competitive with US-based semiconductor firms or FAANG companies.",
        sourcesCount: 4,
        sentiment: "positive",
        issues: [
          "Salary ranges are broad and not location-specific",
          "Post-IPO stock option value fluctuates",
          "Comparison to US tech pay may mislead UK candidates",
        ],
      },
      {
        model: "Perplexity",
        modelIcon: "🔵",
        response:
          "Arm has an exceptional Glassdoor rating of 4.4/5, with 91% of employees recommending it as a workplace. The Cambridge-headquartered semiconductor company is praised for its collaborative teams, high engineering standards, and strong learning environment. Employees highlight good work-life balance (4.4/5) and strong culture and values (4.5/5). Salary data on Glassdoor suggests engineering roles range from £45K-130K. The company went public on NASDAQ in 2023, which has created additional wealth-building opportunities through stock. Reddit discussions describe Arm as 'a fantastic company to work for' with an open, friendly, and professional culture. Some criticism centres on pay being lower than other semiconductor companies for comparable roles.",
        sourcesCount: 7,
        sentiment: "positive",
        issues: [
          "Reddit discussion cited is from 2013 — may be outdated",
          "Glassdoor rating may include global offices, not just Cambridge",
          "IPO-related stock benefits may have changed since listing",
        ],
      },
      {
        model: "Gemini",
        modelIcon: "🟣",
        response:
          "Arm is a globally influential semiconductor design company headquartered in Cambridge, UK. The workplace culture is frequently described as collaborative and technically excellent, with a strong emphasis on open communication and knowledge sharing. Work-life balance is considered very good for the tech industry. Compensation is competitive for the UK market, with engineering salaries supplemented by stock options and comprehensive benefits. The company's IPO has brought renewed energy and growth opportunities. Employee reviews are overwhelmingly positive, with particular praise for the quality of colleagues and the intellectual challenge of the work. Career progression pathways are well-established.",
        sourcesCount: 4,
        sentiment: "positive",
        issues: [
          "No specific salary figures provided",
          "Very generic positive assessment lacks detail",
          "Missing information on remote/hybrid policy specifics",
        ],
      },
    ],
    overallScore: 78,
    keyIssues: [
      "AI narrative is overwhelmingly positive but lacks specifics",
      "Pay competitiveness framing varies — UK-good vs global-average",
      "Old Reddit discussion (2013) still surfaces in AI responses",
      "No structured employer data feeding AI — relies on reviews",
      "Could improve further with official salary bands and benefits data",
    ],
  },
  {
    company: "Starling Bank",
    domain: "starlingbank.com",
    slug: "starling-bank",
    industry: "Fintech",
    employees: "3,200+",
    snapshotDate: "2026-02-12",
    responses: [
      {
        model: "ChatGPT",
        modelIcon: "🟢",
        response:
          "Starling Bank is a UK challenger bank with a divided employer reputation. On the positive side, employees praise the innovative product, smart colleagues, and the opportunity to work at a genuinely disruptive financial institution. The company offers flexible working and a modern office environment. However, there are significant criticisms around management style, with the founder CEO Anne Boden's leadership frequently described as hands-on to a fault. Salaries are generally considered below market for London fintech, with limited career progression opportunities. The company has been expanding its Cardiff and Southampton offices, which some London employees see as a shift in focus away from the capital.",
        sourcesCount: 3,
        sentiment: "mixed",
        issues: [
          "Anne Boden stepped down as CEO — AI may reference outdated leadership",
          "Salary data not specific enough",
          "Office expansion narrative may be outdated",
        ],
      },
      {
        model: "Perplexity",
        modelIcon: "🔵",
        response:
          "Starling Bank has a Glassdoor rating of 3.4/5, with only 60% of employees recommending it — notably lower than competitors like Monzo (4.1/5). London employees rate it 3.8/5. Reviews are highly polarised: some describe 'a great environment crammed with extremely clever people,' while others call it 'a god awful place to work.' Key complaints include poor management, people 'disappearing without warnings,' below-market pay, and a founder-driven culture that could be toxic. Career progression scores are low at 3.3/5. Compensation is rated 3.5/5 for London. The bank has faced criticism for its handling of internal communications and performance reviews.",
        sourcesCount: 6,
        sentiment: "negative",
        issues: [
          "Glassdoor reviews include extreme outliers on both ends",
          "Founder CEO references may be outdated post-transition",
          "Anonymous review bias towards negative experiences",
          "No distinction between tech and operational roles",
        ],
      },
      {
        model: "Gemini",
        modelIcon: "🟣",
        response:
          "Starling Bank is a UK digital challenger bank offering roles across technology, operations, and financial services. The work environment is described as fast-paced with exposure to modern banking technology. Employee reviews are mixed — the company is praised for its product innovation and flexible working culture, but criticised for management inconsistencies and limited salary growth. Benefits are reasonable, and the company has invested in office spaces in London, Cardiff, and Southampton. The transition from founder-led to professional management has been a significant recent change. Some employees report a friendly atmosphere while others note internal politics and favouritism.",
        sourcesCount: 3,
        sentiment: "mixed",
        issues: [
          "Vague on salary specifics",
          "Management transition not well-documented in AI data",
          "Conflicting culture descriptions not reconciled",
        ],
      },
    ],
    overallScore: 34,
    keyIssues: [
      "Highly polarised reviews create an inconsistent AI narrative",
      "Founder CEO criticism dominates despite leadership change",
      "Below-market pay narrative is prominent across all models",
      "Perplexity surfaces the most negative reviews prominently",
      "No structured employer content to counterbalance anonymous reviews",
      "Strong opportunity for AI reputation improvement with updated data",
    ],
  },
  {
    company: "Ocado Technology",
    domain: "ocadogroup.com",
    slug: "ocado-technology",
    industry: "E-commerce / Robotics",
    employees: "4,000+",
    snapshotDate: "2026-02-12",
    responses: [
      {
        model: "ChatGPT",
        modelIcon: "🟢",
        response:
          "Ocado Technology is the tech arm of the Ocado Group, focused on building robotics, automation, and e-commerce platforms. Based primarily in Hatfield, the company is known for tackling genuinely interesting engineering problems including warehouse robotics and autonomous systems. Employees praise the quality of colleagues, good benefits including share options, and a generally positive culture. Work-life balance is rated well. Salaries for engineering roles range from £45K-100K. The Hatfield campus has modern facilities designed to emulate tech-company environments. Some employees note legacy software challenges and that career progression pathways can be unclear or slow.",
        sourcesCount: 4,
        sentiment: "positive",
        issues: [
          "Salary data not well-sourced",
          "Legacy software concern may be resolved",
          "Hatfield location may deter London-based candidates",
        ],
      },
      {
        model: "Perplexity",
        modelIcon: "🔵",
        response:
          "Ocado Technology has a Glassdoor rating of 3.9/5, with 71% of employees recommending it. Work-life balance scores 4.1/5 and culture 4.0/5. Hatfield-based employees rate it 3.9/5 with 327 reviews. Positive themes include 'nice and brilliant people to work with,' good pay, share options, interesting work, and good benefits. The head office is described as having a 'Google-like' campus feel. Criticisms include legacy software, unclear career progression, and the fact that as part of the wider Ocado Group (rated lower at 3.2/5 for compensation), the tech division's reputation can be conflated with warehouse operations. Engineering salaries are competitive for the Hatfield/Hertfordshire area.",
        sourcesCount: 6,
        sentiment: "positive",
        issues: [
          "Ocado Group vs Ocado Technology distinction is blurred",
          "Warehouse operations reputation affects tech brand",
          "Career progression concern is recurring",
          "Glassdoor rating may combine all Ocado entities",
        ],
      },
      {
        model: "Gemini",
        modelIcon: "🟣",
        response:
          "Ocado Technology offers an interesting workplace for engineers and technologists interested in robotics, AI, and large-scale e-commerce systems. The Hatfield-based company provides a modern working environment with good benefits and flexible working arrangements. Employee satisfaction is generally positive, with particular praise for the quality of colleagues and the technical challenges available. Compensation includes competitive salaries for the region plus share options. The company is part of the Ocado Group, which also operates grocery retail and logistics — this broader brand context can sometimes overshadow the technology division's distinct culture. Career development receives mixed reviews.",
        sourcesCount: 3,
        sentiment: "positive",
        issues: [
          "No specific salary figures",
          "Group vs Technology distinction not clear",
          "Missing details on remote work policy",
        ],
      },
    ],
    overallScore: 58,
    keyIssues: [
      "AI confuses Ocado Technology with Ocado Group (retail/logistics)",
      "Warehouse operations reputation drags down the tech brand",
      "Career progression is a consistent concern across all models",
      "Hatfield location undersold — modern campus not well-represented",
      "Good opportunity to differentiate tech division with structured data",
    ],
  },
  {
    company: "Checkout.com",
    domain: "checkout.com",
    slug: "checkout-com",
    industry: "Payments",
    employees: "1,800+",
    snapshotDate: "2026-02-12",
    responses: [
      {
        model: "ChatGPT",
        modelIcon: "🟢",
        response:
          "Checkout.com is a London-based payments infrastructure company that has become one of Europe's most valuable fintech unicorns. The company is known for offering high compensation — often at the upper end of the London market — with generous bonuses and strong benefits including daily lunch in the office. The work environment is fast-paced with exposure to complex payment systems and a talented engineering team. However, following rapid growth and a valuation correction, the company went through redundancies which affected morale. Some employees report strict return-to-office policies and not enough desk space. Work-life balance varies by team, with some noting intense periods around product launches.",
        sourcesCount: 4,
        sentiment: "mixed",
        issues: [
          "Valuation correction narrative may be outdated",
          "Redundancy impact on current culture not assessed",
          "RTO policy details may have changed",
        ],
      },
      {
        model: "Perplexity",
        modelIcon: "🔵",
        response:
          "Checkout.com employees rate compensation and benefits 4.4/5 on Glassdoor. London salaries range from £41K for analysts to £149K for senior engineering managers. The company is praised for its fast-paced environment, brilliant colleagues, good salary, and generous year-end bonuses. Employee reviews describe the tech stack as 'very interesting' and the learning opportunities as 'incredible.' However, Reddit discussions paint a more nuanced picture — one thread in r/cscareerquestionsuk notes strict RTO policies, insufficient desk space, and mixed experiences post-redundancy. Pre-redundancy employees largely enjoyed the experience but many have since left. Blind reviews from 2024 discuss the company's culture shift.",
        sourcesCount: 7,
        sentiment: "mixed",
        issues: [
          "Post-redundancy culture shift not fully captured",
          "Reddit feedback is from a small sample",
          "Salary data may not reflect post-correction packages",
          "Blind reviews skew negative",
        ],
      },
      {
        model: "Gemini",
        modelIcon: "🟣",
        response:
          "Checkout.com is a leading payments technology company headquartered in London. The company offers competitive compensation packages that are typically above market rate, along with excellent office facilities and benefits such as free lunch. The engineering culture is well-regarded, with interesting technical challenges in building global payment infrastructure. The company has experienced significant growth and is considered a prestigious employer in the London tech scene. Recent organisational changes following a valuation reassessment have led to some restructuring. Employee reviews highlight strong learning opportunities and high-calibre colleagues, though some note that the rapid pace can be demanding.",
        sourcesCount: 4,
        sentiment: "positive",
        issues: [
          "Valuation reassessment framed too neutrally",
          "No mention of RTO controversy",
          "Restructuring impact understated",
        ],
      },
    ],
    overallScore: 55,
    keyIssues: [
      "Redundancy and restructuring narrative dominates recent discussions",
      "High compensation partially offsets culture concerns in AI responses",
      "RTO policy controversy appears in Reddit but not in main AI summaries",
      "Post-valuation-correction morale shift not well-captured",
      "Could benefit from structured data showing current culture improvements",
    ],
  },
  {
    company: "Sky Betting & Gaming",
    domain: "flutter.com",
    slug: "sky-betting-gaming",
    industry: "Gaming Tech",
    employees: "2,500+",
    snapshotDate: "2026-02-12",
    responses: [
      {
        model: "ChatGPT",
        modelIcon: "🟢",
        response:
          "Sky Betting & Gaming (SBG), now part of Flutter Entertainment, is one of the largest tech employers in Leeds. The company is known for a historically strong culture that employees describe as fun, collaborative, and benefits-rich. The Leeds office is modern and well-equipped. Benefits include good bonuses and flexible working arrangements. However, recent reviews suggest the culture has been shifting following the Flutter acquisition, with some employees noting declining morale, slower salary progression, and concerns about favouritism. Tech roles offer interesting challenges in high-traffic, real-time systems. Salaries range from competitive for Leeds to below-market for more senior positions.",
        sourcesCount: 3,
        sentiment: "mixed",
        issues: [
          "Flutter acquisition impact not fully assessed",
          "Salary data is vague",
          "Historic vs current culture not distinguished",
        ],
      },
      {
        model: "Perplexity",
        modelIcon: "🔵",
        response:
          "Sky Betting & Gaming has a Glassdoor rating of 3.8/5, with 72% of employees recommending it. Leeds employees rate work-life balance 3.9/5 and culture 3.9/5, but career opportunities score lower at 3.7/5. Salaries in Leeds range from £19.5K for customer experience roles to £89.5K for heads of product. Employee reviews are increasingly polarised — positive reviews praise the benefits, flexible working, and team camaraderie, while negative reviews describe 'toxic positivity,' 'performative' culture, favouritism, and pay that hasn't kept pace with inflation. The company's acquisition by Flutter Entertainment has led to cultural changes that not all employees view positively. Shift patterns in operational roles receive criticism.",
        sourcesCount: 6,
        sentiment: "mixed",
        issues: [
          "Salary range includes non-tech roles, skewing low",
          "Toxic positivity claims from individual reviews amplified",
          "Flutter integration impact still unfolding",
          "Leeds vs London pay expectations not contextualised",
        ],
      },
      {
        model: "Gemini",
        modelIcon: "🟣",
        response:
          "Sky Betting & Gaming, operating under Flutter Entertainment, is a major tech employer based in Leeds. The company offers roles in software engineering, product management, and data science within the online betting and gaming sector. The workplace culture has traditionally been praised as one of the best in Leeds tech, with strong benefits, a modern office, and genuine team spirit. However, following the acquisition by Flutter, some employees report cultural dilution and concerns about the direction of the company. Compensation is reasonable for the Leeds market but salary progression can be slow. The gambling industry context means some candidates may have ethical considerations about the sector.",
        sourcesCount: 3,
        sentiment: "mixed",
        issues: [
          "Ethical framing of gambling sector may deter candidates",
          "No specific salary figures for tech roles",
          "Cultural changes post-acquisition are speculative",
        ],
      },
    ],
    overallScore: 46,
    keyIssues: [
      "Flutter acquisition has disrupted the historically positive culture narrative",
      "AI models surface both legacy praise and recent negativity without context",
      "Salary data includes non-tech roles, making it appear lower than reality",
      "Gambling industry ethical framing appears in Gemini specifically",
      "No structured employer data to showcase current culture and tech focus",
      "Strong Leeds tech presence undersold — opportunity to lead regional narrative",
    ],
  },
];
