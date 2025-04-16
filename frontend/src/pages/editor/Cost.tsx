import { mdiArrowLeft, mdiChevronRight, mdiContentCopy, mdiMinus, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { shareLatest, useStateObservable } from "@react-rxjs/core";
import { Typography } from "antd";
import { CostTypes } from "blcc-format/Format";
import AppliedCheckboxes from "components/AppliedCheckboxes";
import { CostSavingsSwitch } from "components/CostSavingsSwitch";
import Info from "components/Info";
import SubHeader from "components/SubHeader";
import { Button, ButtonType } from "components/input/Button";
import { TestInput } from "components/input/TestInput";
import { TestTextArea } from "components/input/TestTextArea";
import { TextInputType } from "components/input/TextInput";
import AddCostModal from "components/modal/AddCostModal";
import { Strings } from "constants/Strings";
import { Match } from "effect";
import { motion } from "framer-motion";
import { useSubscribe } from "hooks/UseSubscribe";
import useParamSync from "hooks/useParamSync";
import { AlternativeModel } from "model/AlternativeModel";
import { CostModel } from "model/CostModel";
import { alternatives$ } from "model/Model";
import { EnergyCostModel } from "model/costs/EnergyCostModel";
import ImplementationContractCostFields from "pages/editor/cost/ImplementationContractCostFields";
import InvestmentCapitalCostFields from "pages/editor/cost/InvestmentCapitalCostFields";
import OMRCostFields from "pages/editor/cost/OMRCostFields";
import OtherCostFields from "pages/editor/cost/OtherCostFields";
import OtherNonMonetaryCostFields from "pages/editor/cost/OtherNonMonetaryCostFields";
import RecurringContractCostFields from "pages/editor/cost/RecurringContractCostFields";
import ReplacementCapitalCostFields from "pages/editor/cost/ReplacementCapitalCostFields";
import WaterCostFields from "pages/editor/cost/WaterCostFields";
import EnergyCostFields from "pages/editor/cost/energycostfields/EnergyCostFields";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Subject, combineLatest, map } from "rxjs";
import sToggleAlt$ = CostModel.sToggleAlt$;

const { Title } = Typography;

const openCostModal$ = new Subject<void>();

export default function Cost() {
    useParamSync();

    const [altsThatInclude$, sConfirmBaselineChange$] = useMemo(() => {
        const altsThatInclude$ = combineLatest([alternatives$, CostModel.id$]).pipe(
            map(
                ([alternatives, id]) =>
                    new Set(alternatives.filter((alt) => alt.costs.includes(id)).map((alt) => alt.id ?? -1)),
            ),
            shareLatest(),
        );

        const sConfirmBaselineChange$ = new Subject<boolean>();

        return [altsThatInclude$, sConfirmBaselineChange$];
    }, []);

    useSubscribe(sConfirmBaselineChange$);

    const navigate = useNavigate();
    const alternativeID = AlternativeModel.useID();
    const alternativeName = useStateObservable(AlternativeModel.name$);

    /*useDbUpdate(costSavingsChange$, costCollection$, "costSavings");*/
    //useDbUpdate(description$.pipe(defaultValue(undefined)), costCollection$, "description");
    useSubscribe(
        CostModel.Actions.removeCost$,
        () => navigate(`/editor/alternative/${alternativeID}`, { replace: true }),
        [alternativeID],
    );
    useSubscribe(CostModel.Actions.clone$, (id) => navigate(`/editor/alternative/${alternativeID}/cost/${id}`), [
        alternativeID,
    ]);
    //useSubscribe(combineLatest([costID$, toggleAlt$]), toggleAlternativeCost);

    const costType = CostModel.type.use();
    const fuelType = EnergyCostModel.fuelType.use();

    return (
        <motion.div
            className={"flex h-full w-full flex-col"}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, speed: 0.5 }}
            transition={{ duration: 0.2 }}
        >
            <AddCostModal
                open$={openCostModal$.pipe(map(() => (costType === CostTypes.ENERGY ? fuelType : costType)))}
            />

            <SubHeader>
                <div className="flex justify-between">
                    <div className={"flex flex-row items-center"}>
                        <Button
                            type={ButtonType.LINK}
                            icon={mdiArrowLeft}
                            onClick={() => navigate(`/editor/alternative/${alternativeID}`, { replace: true })}
                        >
                            {alternativeName}
                        </Button>
                        <Icon path={mdiChevronRight} size={0.8} className={"text-ink"} />
                        <p className={"px-2 text-ink"}>{CostModel.name.use()}</p>
                    </div>
                    <div className={"px-6"}>
                        <Button type={ButtonType.LINK} icon={mdiPlus} onClick={() => openCostModal$.next()}>
                            Add Cost
                        </Button>
                        <Button
                            type={ButtonType.LINK}
                            icon={mdiContentCopy}
                            onClick={() => CostModel.Actions.cloneClick$.next()}
                            tooltip={Strings.CLONE}
                        >
                            Clone
                        </Button>
                        <Button
                            type={ButtonType.LINKERROR}
                            icon={mdiMinus}
                            onClick={() => CostModel.Actions.deleteCurrent()}
                            tooltip={Strings.DELETE}
                        >
                            Remove
                        </Button>
                    </div>
                </div>
            </SubHeader>

            <div className={"h-full w-full overflow-y-auto"}>
                <div className={"max-w-screen-lg p-6"}>
                    <div className={"grid grid-cols-2 gap-x-16 gap-y-4"}>
                        <TestInput
                            type={TextInputType.PRIMARY}
                            label={"Name*"}
                            getter={CostModel.name.use}
                            onChange={(event) => CostModel.name.set(event.currentTarget.value)}
                            error={CostModel.name.useValidation}
                        />
                        <div className={"flex flex-col"}>
                            <Title level={5}>
                                <Info text={Strings.ALTERNATIVES_APPLIED_TO}>Alternatives applied to</Info>
                            </Title>
                            <AppliedCheckboxes value$={altsThatInclude$} sToggle$={sToggleAlt$} />
                        </div>
                        <span className={"col-span-2"}>
                            <TestTextArea
                                label={"Description"}
                                className={"max-h-36 w-full"}
                                getter={CostModel.description.use}
                                onChange={(event) => CostModel.description.set(event.currentTarget.value)}
                            />
                        </span>
                        <CostSavingsSwitch />
                    </div>
                </div>
                <div className={"mb-32 border-base-lighter border-t"}>
                    {Match.value(costType).pipe(
                        Match.when(CostTypes.ENERGY, () => <EnergyCostFields />),
                        Match.when(CostTypes.WATER, () => <WaterCostFields />),
                        Match.when(CostTypes.CAPITAL, () => <InvestmentCapitalCostFields />),
                        Match.when(CostTypes.REPLACEMENT_CAPITAL, () => <ReplacementCapitalCostFields />),
                        Match.when(CostTypes.OMR, () => <OMRCostFields />),
                        Match.when(CostTypes.IMPLEMENTATION_CONTRACT, () => <ImplementationContractCostFields />),
                        Match.when(CostTypes.RECURRING_CONTRACT, () => <RecurringContractCostFields />),
                        Match.when(CostTypes.OTHER, () => <OtherCostFields />),
                        Match.when(CostTypes.OTHER_NON_MONETARY, () => <OtherNonMonetaryCostFields />),
                        Match.exhaustive,
                    )}
                </div>
            </div>
        </motion.div>
    );
}
