import { useStateObservable } from "@react-rxjs/core";
import { Divider } from "antd";
import Title from "antd/es/typography/Title";
import { Defaults } from "blcc-format/Defaults";
import {
	AnalysisType,
	DiscountingMethod,
	DollarMethod,
	Purpose,
} from "blcc-format/Format";
import Location from "components/Location";
import YearDisplay from "components/YearDisplay";
import { Dropdown } from "components/input/Dropdown";
import { NumberInput } from "components/input/InputNumber";
import Switch from "components/input/Switch";
import { TextArea } from "components/input/TextArea";
import TextInput, { TextInputType } from "components/input/TextInput";
import { motion } from "framer-motion";
import { Model } from "model/Model";
import { max, min } from "model/rules/Rules";
import DiscountRates from "pages/editor/general_information/DiscountRates";
import GhgInput from "pages/editor/general_information/GhgInput";

export default function GeneralInformation() {
	//TODO make ghg values removable
	//TODO make location reset when switching to US vs non-US

	const constructionPeriod = useStateObservable(Model.constructionPeriod$);

	return (
		<motion.div
			className={"w-full h-full overflow-y-auto"}
			exit={{ opacity: 0 }}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.1 }}
		>
			<div className={"max-w-screen-lg p-6 mb-16"}>
				<div className={" grid grid-cols-2 gap-x-16 gap-y-4"}>
					<TextInput
						label={"Project Name *"}
						type={TextInputType.PRIMARY}
						placeholder={"Untitled Project"}
						value$={Model.name$}
						wire={Model.sName$}
					/>
					<TextInput
						label={"Analyst"}
						type={TextInputType.PRIMARY}
						value$={Model.analyst$}
						wire={Model.sAnalyst$}
					/>

					<Dropdown
						label={"Analysis Type *"}
						className={"w-full"}
						placeholder={"Please select an analysis type"}
						options={Object.values(AnalysisType)}
						wire={Model.sAnalysisType$}
						value$={Model.analysisType$}
					/>
					{useStateObservable(Model.analysisType$) ===
						"OMB Analysis, Non-Energy Project" && (
						<Dropdown
							label={"Analysis Purpose"}
							className={"w-full"}
							options={Object.values(Purpose)}
							wire={Model.sPurpose$}
							value$={Model.purpose$}
						/>
					)}

					<span className={"col-span-2"}>
						<TextArea
							label={"Description"}
							className={"w-full"}
							value$={Model.description$}
							wire={Model.sDescription$}
						/>
					</span>
					<div className={"col-span-2 grid grid-cols-3 gap-x-16 gap-y-4"}>
						<NumberInput
							label={"Study Period*"}
							addonAfter={"years"}
							defaultValue={0}
							max={Defaults.STUDY_PERIOD + constructionPeriod}
							min={0}
							controls={true}
							allowEmpty
							rules={[max(Defaults.STUDY_PERIOD + constructionPeriod), min(0)]}
							wire={Model.sStudyPeriod$}
							value$={Model.studyPeriod$}
							parser={(input) =>
								input ? Math.trunc(Number.parseInt(input)) : 0
							}
						/>
						<NumberInput
							label={"Construction Period*"}
							addonAfter={"years"}
							defaultValue={0}
							max={Defaults.CONSTRUCTION_PERIOD}
							min={0}
							controls={true}
							wire={Model.sConstructionPeriod$}
							value$={Model.constructionPeriod$}
							parser={(input) =>
								input ? Math.trunc(Number.parseInt(input)) : 0
							}
						/>

						<Dropdown
							className={"w-full"}
							label={"Data Release Year *"}
							options={Model.releaseYears$}
							wire={Model.sReleaseYear$}
							value$={Model.releaseYear$}
						/>
					</div>

					<span className={"col-span-2"}>
						<YearDisplay />
					</span>
				</div>
				<div className={"pt-4"}>
					<Title level={5}>Dollar Analysis</Title>
					<Switch
						left={DollarMethod.CURRENT}
						right={DollarMethod.CONSTANT}
						className={"bg-primary hover:bg-primary"}
						value$={Model.dollarMethod$}
						wire={Model.sDollarMethod$}
						checkedChildren={"Constant"}
						unCheckedChildren={"Current"}
						defaultChecked
					/>
				</div>
				<div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
					<div className={"grid grid-cols-2"}>
						<Divider
							className={"col-span-2"}
							style={{ fontSize: "20px" }}
							orientation={"left"}
							orientationMargin={"0"}
						>
							Discounting
						</Divider>
						<div className={"col-span-2"}>
							{
								<Dropdown
									label={"Discounting Convention *"}
									placeholder={"Please select a discounting convention"}
									options={Object.values(DiscountingMethod)}
									wire={Model.sDiscountingMethod$}
									value$={Model.discountingMethod$}
								/>
							}
						</div>
						<DiscountRates />
					</div>

					<div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
						<Divider
							className={"col-span-2"}
							style={{ fontSize: "20px" }}
							orientation={"left"}
							orientationMargin={"0"}
						>
							Location
						</Divider>
						<Location
							sCountry$={Model.Location.sCountry$}
							country$={Model.Location.country$}
							sCity$={Model.Location.sCity$}
							city$={Model.Location.city$}
							sState$={Model.Location.sState$}
							state$={Model.Location.state$}
							sZip$={Model.Location.sZip$}
							zip$={Model.Location.zip$}
							sStateOrProvince$={Model.Location.sStateOrProvince$}
							stateOrProvince$={Model.Location.stateOrProvince$}
						/>
					</div>
				</div>

				<GhgInput />
			</div>
		</motion.div>
	);
}
