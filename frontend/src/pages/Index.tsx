/// <reference types="vite-plugin-svgr/client" />

import "nist-header-footer.sass";
import { mdiArrowRight } from "@mdi/js";
import NistHeaderFooter from "components/NistHeaderFooter";
import { Button } from "components/input/Button";
import Logo from "images/logo.svg?react";
import { useNavigate } from "react-router-dom";

/**
 * Top level index page that shows information about BLCC and a button to open the editor.
 * @constructor
 */
export default function Index() {
    const navigate = useNavigate();

    return (
        <div className={"flex w-full justify-center overflow-y-auto bg-base-darker xl:py-10"}>
            <div
                className={
                    "flex h-fit min-h-full flex-grow flex-col bg-white " +
                    "xl:max-w-[1440px] xl:rounded-2xl xl:shadow-[0_0_30px_4px_rgba(0,0,0,0.75)]"
                }
            >
                <NistHeaderFooter>
                    <div className={"mt-32 flex flex-col items-center"}>
                        <Logo className={"h-52 w-full"} />
                        <Button
                            className={"my-16"}
                            icon={mdiArrowRight}
                            iconSide={"right"}
                            onClick={() => navigate("editor")}
                        >
                            <div className={"px-2 py-1 text-xl"}>Open BLCC</div>
                        </Button>
                        <div className={"flex w-full flex-col items-center bg-primary-light py-8"}>
                            <div className={"flex w-full max-w-4xl flex-col"}>
                                <span className={"w-[40rem] self-end text-justify"}>
                                    BLCC conducts economic analyses by evaluating the relative cost effectiveness of
                                    capital investments in buildings and building-related systems or components.
                                    Typically, BLCC is used to evaluate alternative designs that have higher initial
                                    costs but lower operating costs over the project life than the lowest-initial-cost
                                    design. It is especially useful for evaluating the costs and benefits of energy and
                                    water conservation and renewable energy projects.
                                </span>
                            </div>
                        </div>
                        <div className={"flex w-full flex-col items-center py-8"}>
                            <div className={"flex w-full max-w-4xl flex-col"}>
                                <span className={"w-[40rem] self-start text-justify"}>
                                    The life cycle cost (LCC) of two or more alternative designs are computed and
                                    compared to determine which has the lowest LCC and is, therefore, more economical in
                                    the long run. BLCC also calculates comparative economic measures for alternative
                                    designs, including net savings, savings-to-investment ratio, adjusted internal rate
                                    of return, and years to payback.
                                </span>
                            </div>
                        </div>
                        <div className={"flex w-full flex-col items-center bg-error-lighter py-8"}>
                            <div className={"flex w-full max-w-4xl flex-col"}>
                                <span className={"w-[40rem] self-end text-justify"}>
                                    Through support from the Department of Energy (DOE) Federal Energy Management
                                    Program (FEMP), the National Institute of Standards and Technology (NIST) developed
                                    life cycle cost analysis support resources to provide computational support for the
                                    analysis of capital investments in buildings, including:
                                    <ul className={"p-4"}>
                                        <li>• Building Life Cycle Cost (BLCC)</li>
                                        <li>
                                            • Energy Escalation Rate Calculator (
                                            <a
                                                className={"visited:text-visited text-primary-dark underline"}
                                                href={"https://pages.nist.gov/eerc/"}
                                            >
                                                EERC
                                            </a>
                                            )
                                        </li>
                                        <li>
                                            •{" "}
                                            <a
                                                className={"visited:text-visited text-primary-dark underline"}
                                                href={"https://doi.org/10.6028/NIST.HB.135e2022-upd1"}
                                            >
                                                Handbook 135
                                            </a>
                                        </li>
                                        <li>
                                            •{" "}
                                            <a
                                                className={"visited:text-visited text-primary-dark underline"}
                                                href={"https://doi.org/10.6028/NIST.IR.85-3273-39"}
                                            >
                                                Annual Supplement to Handbook 135
                                            </a>
                                        </li>
                                        <li>
                                            •{" "}
                                            <a
                                                className={"visited:text-visited text-primary-dark underline"}
                                                href={"https://doi.org/10.18434/mds2-3194"}
                                            >
                                                Data Tables for Annual Supplement
                                            </a>
                                        </li>
                                    </ul>
                                    All these resources can be found at the DOE FEMP{" "}
                                    <a
                                        className={"visited:text-visited text-primary-dark underline"}
                                        href={"https://www.energy.gov/femp/building-life-cycle-cost-programs"}
                                    >
                                        BLCC Program Page
                                    </a>
                                    .
                                </span>
                            </div>
                        </div>
                        <div className={"bg-primary-dark p-10 text-center text-xs text-white"}>
                            This software was developed at the National Institute of Standards and Technology by
                            employees of the Federal Government in the course of their official duties. Pursuant to
                            title 17 Section 105 of the United States Code this software is not subject to copyright
                            protection and is in the public domain. It is an experimental system. NIST assumes no
                            responsibility whatsoever for its use by other parties, and makes no guarantees, expressed
                            or implied, about its quality, reliability, or any other characteristic. We would appreciate
                            acknowledgement if the software is used. This software can be redistributed and/or modified
                            freely provided that any derivative works bear some notice that they are derived from it,
                            and any modified versions bear some notice that they have been modified.
                        </div>
                    </div>
                </NistHeaderFooter>
            </div>
        </div>
    );
}
