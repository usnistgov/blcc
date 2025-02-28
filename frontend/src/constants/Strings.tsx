export namespace Strings {
	const USER_GUIDE_LINK = (
		<a href={"/docs/Placeholder.pdf"} target={"_blank"} rel="noreferrer">
			User Guide
		</a>
	);

	export const ALTERNATIVE_COSTS = (
		<p>
			Alternative Costs for an alternative include all costs that are included
			in the analysis organized by common cost categories and subcategories
			(energy, water, capital, and contract costs). For values that do not fit
			into these defined categories, users can use the Other Costs category to
			include other monetary and non-monetary impacts. For additional details,
			see the {USER_GUIDE_LINK}.
		</p>
	);

	export const ALTERNATIVES_APPLIED_TO = (
		<p>
			Costs can be applied to more than one alternative by checking the box for
			each alternative. If a cost is applied to multiple alternatives, changing
			the cost will change it both all selected alternatives. A cost must be
			applied to at least one alternative.
		</p>
	);

	export const AMOUNT_FINANCED = (
		<p>
			In Financed Projects, the initial capital component cost is divided into
			Initial Cost (Paid by Agency) and Amount Financed. Their sum, adjusted by
			the Annual Rate of Change during the Study Period, is the basis for
			calculating the Residual Value of the capital component. Note: The Amount
			Financed is used only to calculate the Residual Value; it is not included
			in the LCC calculations, since any financed amounts would be included in
			the Contract Payment.
		</p>
	);

	export const ANALYSIS_PURPOSE = (
		<div>
			<p>
				Information icon - For OMB projects, following the guidelines of
				Circular A-94, select either
			</p>
			<ul>
				<li>
					(a) Cost-effectiveness, lease-purchase, internal government
					investment, and asset sales
				</li>
				<li>
					(b) Public investment and regulatory analyses. Discount rates differ
					according to the type of analysis
				</li>
			</ul>
			<p>For details, see {USER_GUIDE_LINK}.</p>
		</div>
	);

	export const ANALYSIS_TYPE = (
		<p>
			BLCC provides 6 Types of Analysis: 1.Federal Analysis, Financed Project:
			Used for an LCC analysis of Energy Savings Performance Contracts (ESPC),
			Utility Energy Services Contracts (UESC) or other alternatively financed
			investments in energy or water conservation in the Federal Government. The
			criteria used as defaults in this module are applicable to all agencies in
			the Federal Government. 2.FEMP Analysis, Energy Project: The criteria
			follow the life-cycle costing rules of the Federal Energy Management
			Program according to 10 CFR 436A as they apply to energy and water
			conservation and renewable energy projects funded by agencies from direct
			appropriations. 3.OMB Analysis, Non-Energy Project: The analysis is
			subject to the life-cycle costing guidelines of OMB Circular A-94 for the
			following types of projects: (a) Cost-effectiveness, lease-purchase,
			internal government investment, and asset sales (b) Public investment and
			regulatory analyses 4.MILCON Analysis, Energy Project: Supports LCC
			analyses, according to 10 CFR 436A, of agency-funded energy and water and
			renewable energy projects for military construction in the Army, Navy, and
			Air Force. 5.MILCON Analysis, Non-Energy Project: Supports LCC analyses of
			new acquisition or construction projects, lease-purchase decisions,
			modification of existing facilities and similar projects the purpose of
			which is not primarily to assess 6.MILCON Analysis, ERCIP Project: Used
			for generating results for ERCIP MILCON projects funded by the DoD Energy
			Resilience Conservation Investment Program to retrofit existing energy
			systems.
		</p>
	);

	export const ANALYST = <p>Person completing the analysis</p>;

	export const ANNUAL_CONSUMPTION = (
		<p>
			Annual consumption during the initial year of operation is used as the
			basis for consumption for all future years by combining the value with the
			Usage Index. The user can modify the unit of measure.
		</p>
	);

	export const ANNUAL_RATE_OF_CHANGE = (
		<p>
			The average annual rate at which the cost of this capital component is
			expected to change throughout the Study Period. BLCC uses this variable to
			adjust the base-year initial cost of this component before calculating its
			Residual Value (resale value, salvage value). If the study is performed in
			constant dollars, this rate of increase should not include general
			inflation, but instead reflect only real rates of change during this
			period.
		</p>
	);

	export const BASELINE_ALTERNATIVE = (
		<p>
			Alternative that is used as the baseline (or base case) for comparisons
		</p>
	);

	export const CAPITAL_COSTS = (
		<p>
			Costs associated with the installation, OMR, and replacement of building
			components.
		</p>
	);

	export const CITY = <p>City in which the project is occurring</p>;

	export const CLONE = <p>Clone the selected alternative or cost</p>;

	export const CONSTRUCTION_PERIOD = (
		<p>
			The Construction Period (or Planning/Construction/Installation Period) is
			the timeframe it takes for the project to be completed and ready for
			service, and can be up to 3 years in length. The study period begins at
			the end of the construction period.
		</p>
	);

	export const CONTRACT_COSTS = (
		<p>Costs associated with the implementation and payment of contracts.</p>
	);

	export const COST_ADJUSTMENT_FACTOR = (
		<p>
			If initial capital component costs are phased in over the construction
			phase, the Cost Adjustment Factor is the average annual rate at which the
			Initial Cost of this component is adjusted to its value in any year of the
			P/C/I Period. The Cost Adjustment Factor can, for example, be a
			contractual rate (sometimes equal to zero) or a rate determined by the
			agency. It may be different from the general Rate of Increase that
			represents the escalation to be expected during the Study Period for the
			purpose of calculating the residual value of the component. If the study
			is performed in constant dollars, the Cost Adjustment Factor should not
			include general inflation but instead reflect only real rates of change
			during this period. If the study is performed in current dollars, the Cost
			Adjustment Factor should include general inflation.
		</p>
	);

	export const COST_OR_SAVINGS = (
		<p>
			The Cost or Savings toggle allows the user to specify whether data will be
			inputted as a cost or as cost savings (negative costs). Headings will
			update based on this selection for consumption and cost per unit.
		</p>
	);

	export const COST_PER_UNIT = (
		<p>
			The cost per unit (in base year dollars) for the initial year of the study
			period is used as the basis for energy prices for all future years by
			combining the value with Escalation Rates.
		</p>
	);

	export const INITIAL_PHASE_IN = (
		<p>
			Initial capital component costs may be phased in over a
			Planning/Construction or Installation (P/C/I) Period. BLCC discounts from
			the date shown in the schedule to the base date the portion of Initial
			Cost allocated to any year in the P/C/I Period. Note: For MILCON analysis,
			if the Beneficial Occupancy Date is later than the Base Date, the Initial
			Cost may be entered at the Midpoint of Construction. This procedure is
			suggested in the DoD Memorandum of Agreement on Criteria/Standards for
			Economic Analysis/Life-Cycle Costing for MILCON Design, March 1994.
			However, the US Army Corps of Engineers in its web site Economic Analysis
			Reference Guide  recommends that DD 1391 Front Page total request should
			equal the initial construction costs in the analysis; also, these costs
			should be evenly divided throughout the lead or construction time.  The
			BLCC cost adjustment feature accommodates either method.
		</p>
	);

	export const COUNTRY = <p>Country in which the project is occurring</p>;

	export const CUSTOMER_SECTOR = (
		<p>
			The user can elect from a customer type for which default escalation rates
			are provided using a combination of fuel type, customer sector, and
			location (ZIP).
		</p>
	);

	export const DATA_RELEASE_YEAR = (
		<p>
			Data Release Year allows the user to select the year for which the data
			was released in the Annual Supplement to Handbook 135. The default value
			is the most recent release. The base date of the analysis is assumed to
			start in the selected release year. Thus, selecting previously released
			data should only be used for validating previously completed analysis. For
			additional guidance, see the {USER_GUIDE_LINK}.
		</p>
	);

	export const DELETE = <p>Delete the selected alternative or cost</p>;

	export const DEMAND_CHARGE = (
		<p>
			Demand Charges cover, for example, fixed monthly customer charges or
			charges for peak power demand. Enter these costs as annual amounts in
			base-year dollars. The escalation rates used for energy costs are also
			used to escalate these demand charges.
		</p>
	);

	export const DESCRIPTION = <p>Summary description of the project</p>;

	export const DISCOUNTING = (
		<p>
			Discounting assumptions are used to complete the analysis and are
			auto-populated using default data based on the Analysis Type and Data
			Release Year. For additional guidance on discount rates, see the{" "}
			{USER_GUIDE_LINK}.
		</p>
	);

	export const DISCOUNTING_CONVENTION = (
		<p>
			If end-of-year discounting is selected, costs will be discounted to the
			base date from the end of the year in which they occur. If mid-year
			discounting is selected, costs will be discounted to the base date from
			the middle of the year. End-of-year discounting is the default for all
			types of analyses, except for MILCON analyses. MILCON analyses require
			mid-year discounting, and the designated MILCON modules use mid-year
			discounting as the default.
		</p>
	);

	export const DISPOSAL = (
		<p>
			Disposal is the amount of water disposed in the initial year of operation.
			The user can provide values for either two or four seasons with unique
			usage and prices for each. These values are used in combination with the
			Escalation Rates and Usage Index to estimate future costs, which are
			assumed the same for both usage and disposal.
		</p>
	);

	export const DOLLAR_ANALYSIS = (
		<p>
			If constant dollars (excluding inflation) is selected, the discount rate
			and all price escalation rates need to be entered in real terms (excluding
			inflation). The default values can be edited if a user prefers to perform
			the analysis in current dollars, but in general constant-dollar analysis
			is preferable if no tax or financing variables need to be included. If
			current-dollar analysis is selected, the discount rate and all price
			escalation rates need to be entered in nominal terms (including
			inflation). (The default inflation rate in BLCC5 is the average long-term
			inflation rate calculated annually for DOE/FEMP projects according to
			10CFR436). The present-value life-cycle costs and supplementary measures
			will be the same for either constant- or current-dollar analysis if the
			discount rate and all price escalation rates are entered consistently
			either in real or nominal terms.
		</p>
	);

	export const EIA_PROJECT_SCENARIO = (
		<p>
			EIA produces a range of projection scenarios. The Reference Case has
			historically been the case used for the energy price escalation rate
			estimates and recommended by FEMP. Currently, BLCC currently only provides
			data for the Reference Case. Data for other scenarios could be included if
			deemed useful by BLCC users.
		</p>
	);

	export const EMISSIONS_RATE_SCENARIO = (
		<p>
			Emissions rate projections are selected based on the data source and the
			emission rate type. Only one data source (NIST-NETL) and emissions rate
			type (Average) are currently provided by BLCC. BLCC is designed to allow
			for alternative data sources (NREL's Cambium projections) and emission
			rate types (i.e., long-run marginal rates) if desired by users. For
			details, see the {USER_GUIDE_LINK}.
		</p>
	);

	export const ENERGY_COSTS = <p>Energy-related costs</p>;

	export const ESCALATION_RATES = (
		<p>
			Escalation rates account for projected cost changes and are defaulted
			based on the fuel type, customer type, and location (ZIP Code). The user
			can modify these escalation rates if desired. No default values are
			provided for water costs. For additional details, see {USER_GUIDE_LINK}.
		</p>
	);

	export const EXPECTED_LIFETIME_INFO = (
		<p>
			Enter the expected useful life (years) of the component. This is intended
			to be a realistic assessment of the component life, independent of the
			study period or depreciation life assigned to the component for income tax
			purposes.
		</p>
	);

	export const EXPECTED_LIFETIME_TOOLTIP = (
		<p>
			The expected service life of the component from beginning of service date.
		</p>
	);

	export const FAQ = <p>Common Questions about BLCC (PDF)</p>;

	export const FUEL_TYPE = (
		<p>
			The user can select from a list of fuel types for which default escalation
			rates are provided using a combination of fuel type, customer sector, and
			location (ZIP).
		</p>
	);

	export const GHG_ASSUMPTIONS = (
		<p>
			Assumptions used to estimate the energy-related emissions and societal
			costs
		</p>
	);

	export const HOME = <p>Return to homepage</p>;

	export const INFLATION_RATE = (
		<p>
			If current dollar analysis is selected, the general rate of inflation is
			required and will be defaulted based on the annually published values in
			the Annual Supplement to Handbook 135.
		</p>
	);

	export const INITIAL_COST_INFO = (
		<p>
			Initial Cost is the total installed cost of the component, unadjusted for
			price escalation. If the Initial Cost is to be phased in over one or more
			years from the Base Date, BLCC5 uses a Cost-Phasing Schedule and a Cost
			Adjustment Factor to calculate the actual component cost in any year of
			the Construction Phase.
		</p>
	);

	export const INITIAL_COST_TOOLTIP = (
		<p>The total installed cost of the component in base year dollars.</p>
	);

	export const INITIAL_OCCURRENCE = (
		<p>Initial Occurrence is the initial year that the cost occurs.</p>
	);

	export const INITIAL_OCCURRENCE_AFTER_SERVICE = (
		<p>Years after service date of the initial occurrence</p>
	);

	export const LOCATION = (
		<p>
			Location is used to populate default values for energy escalation rates
			and emissions rates. The location provided under General Information is
			used as the primary location of the project and used as the default values
			for energy costs. If the project being analyzed includes energy costs
			occurring in different locations, the user can change the location for
			each energy cost. Default energy-related data is matched by ZIP code and
			is required. For additional guidance, see the {USER_GUIDE_LINK}.
		</p>
	);

	export const NEW = <p>Create a New BLCC file</p>;

	export const NOMINAL_DISCOUNT_RATE = (
		<p>
			If current dollar analysis is selected, the nominal discount rate is
			required and will be defaulted based on the annually published values in
			the Annual Supplement to Handbook 135 for the selected analysis type.
		</p>
	);

	export const NUMBER_OF_UNITS_INFO = (
		<p>
			Number of units of the impact. Other Costs provides users with the ability
			to include impacts that do not align with the defined cost categories,
			such as productivity improvements, human health benefits, resilience
			benefits, and environmental impacts. The user can customize the unit of
			measure to whatever unit is appropriate. The user can include the impacts
			in non-economic terms by using Other – Non-Monetary Costs or include an
			economic value to these impacts using Other – Monetary Costs.
		</p>
	);

	export const NUMBER_OF_UNITS_TOOLTIP = <p>Quantity of the selected units.</p>;

	export const OCCURRENCE = (
		<p>Years after the service date of the occurrence.</p>
	);

	export const OPEN = <p>Open an Existing BLCC file</p>;

	export const OTHER_COSTS = (
		<p>
			Costs that do not fit into the defined categories (both monetary and
			non-monetary values).
		</p>
	);

	export const PROJECT_NAME = <p>Title of project being analyzed</p>;

	export const REAL_DISCOUNT_RATE = (
		<p>
			If constant dollar analysis is selected, the real discount rate is
			required and will be defaulted based on the annually published values in
			the Annual Supplement to Handbook 135 for the selected analysis type.
		</p>
	);

	export const REBATE = (
		<p>
			A rebate is entered as an annual base-year dollar amount. (One-time
			rebates can be subtracted from initial costs). The escalation rates used
			for energy costs are also used for annual utility rebates.
		</p>
	);

	export const RECURRING = (
		<p>
			Select One-Time if the cost only occurs once. Select Recurring is the cost
			repeats at regular intervals over the study period.
		</p>
	);

	export const RESIDUAL_VALUE = (
		<p>
			This is the value of the initial cost that you expect the component to
			retain as residual (resale or salvage value or disposal cost). Enter a
			negative value if the residual value is a disposal cost. The user can
			provide the residual value in total dollars or as a percentage of the
			initial cost. The residual value is adjusted using the Annual Rate of
			Change.
		</p>
	);

	export const SAVE = <p>Save Current BLCC file</p>;

	export const SOCIAL_COST_GHG = (
		<p>
			Social costs of GHG emissions are based on several scenarios published in
			the most recent report from the Interagency Working Group on the Social
			Cost of Greenhouse Gases. For details, see the {USER_GUIDE_LINK}.
		</p>
	);

	export const STATE = <p>State in which the project is occurring</p>;

	export const STUDY_PERIOD = (
		<p>
			The study period is the timeframe over which the analysis is completed.
			The study period can be up to 40 years of service plus the length of the
			construction period, which can be up to 3 years.
		</p>
	);

	export const TAGS_INFO = (
		<p>
			Tags allow the user to create custom category name(s) for other costs,
			benefits, and non-monetary values the user wants to include in the
			analysis. Any tags a user create is available for use with additional
			Other Costs.
		</p>
	);

	export const TAGS_TOOLTIP = (
		<p>
			Tags allow the user to create custom category name(s) for other costs.
		</p>
	);

	export const UNIT = (
		<p>
			The user can select the unit of measure for water consumption, providing
			the ability to match the units reported in their water bills.
		</p>
	);

	export const UNIT_RATE_OF_CHANGE = (
		<p>
			If you expect the recurring cost to change in some predictable manner
			(e.g., when ECMs are phased in over a period of time), you can enter Unit
			Rate of Change indices and their duration for each recurring cost. For
			example, you might enter an index of 1.00 for the first year of the
			service period and adjust the usage downward as new ECMs come on line.
		</p>
	);

	export const UNIT_VALUE_INFO = (
		<p>
			Value per unit for an Other Monetary Costs. Other Costs provides users
			with the ability to include monetary values that do not align with the
			defined cost categories. Monetary costs could include costs or benefits
			the user wants to include that have not historically been considered, such
			as the value of productivity improvements, human health benefits, or
			resilience benefits.
		</p>
	);

	export const UNIT_VALUE_TOOLTIP = <p>Value per unit</p>;

	export const USAGE = (
		<p>
			Usage is the amount of water consumed in the initial year of operation.
			The user can provide values for either two or four seasons with unique
			usage and prices for each. These values are used in combination with the
			Escalation Rates and Usage Index to estimate future costs, which are
			assumed the same for both usage and disposal.
		</p>
	);

	export const USAGE_INDEX = (
		<p>
			Usage index allows the user to adjust the quantity consumed across the
			study period if the consumption patterns vary from year to year. The value
			is indexed to the initial year of the study period (NOT year-over-year
			changes). The values are defaulted to 1.00 for all years (unchanged over
			the study period).
		</p>
	);

	export const USER_GUIDE = <p>BLCC User Guide (PDF)</p>;

	export const VALUE_RATE_OF_CHANGE_INFO = (
		<p>
			The rate at which the base-year dollar amount of the recurring cost is
			expected to change throughout the Study Period. If the analysis is
			conducted in constant dollars enter the real rate (excluding inflation),
			otherwise enter the nominal rate (including inflation).
		</p>
	);

	export const VALUE_RATE_OF_CHANGE_TOOLTIP = (
		<p>Rate of change of the recurring cost.</p>
	);

	export const WATER_COST = <p>Water-related costs</p>;

	export const ZIP = (
		<p>ZIP Code in which the project is occurring (required)</p>
	);
}
