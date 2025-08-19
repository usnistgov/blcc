/// <reference types="vite-plugin-svgr/client" />

import "nist-header-footer.sass";
import { mdiChevronDoubleRight, mdiGithub, mdiHome, mdiLink } from "@mdi/js";
import NistHeaderFooter from "components/NistHeaderFooter";
import { Button, ButtonType } from "components/input/Button";
import Logo from "images/logo.svg?react";
import { useNavigate } from "react-router-dom";
import Title from "antd/es/typography/Title";
import FeaturesCard from "components/FeaturesCard";
import analysisUrl from "images/analysis.svg";
import clickUrl from "images/click.svg";
import lockUrl from "images/lock.svg";
import bookUrl from "images/book.svg";
import Nbsp from "util/Nbsp";

/**
 * Top level index page that shows information about BLCC and a button to open the editor.
 * @constructor
 */
export default function Index() {
    const navigate = useNavigate();
    const version = __APP_VERSION__;

    return (
        <div className={"flex w-full justify-center bg-base-darker xl:py-10"}>
            <div
                className={
                    "flex h-fit min-h-full flex-grow flex-col bg-white " +
                    "xl:max-w-[1440px] xl:rounded-2xl xl:shadow-[0_0_30px_4px_rgba(0,0,0,0.75)]"
                }
            >
                <NistHeaderFooter whiteFooter={true} rounded={false}>
                    <div className="sticky top-0 z-50 bg-white px-10 py-4 text-black shadow-md">
                        <Button
                            type={ButtonType.LINK}
                            icon={mdiHome}
                            className="py-2"
                            onClick={() => {
                                window.location.href = "https://www.energy.gov/femp/building-life-cycle-cost-programs";
                            }}
                        >
                            FEMP BLCC Home
                        </Button>
                        <Button
                            type={ButtonType.LINK}
                            icon={mdiLink}
                            className="py-2"
                            onClick={() => {
                                window.location.href = "https://doi.org/10.6028/NIST.TN.2346";
                            }}
                        >
                            Technical Manual
                        </Button>
                        <Button
                            type={ButtonType.LINK}
                            icon={mdiGithub}
                            className="py-2"
                            onClick={() => {
                                window.location.href = "https://github.com/usnistgov/blcc";
                            }}
                        >
                            Github
                        </Button>
                        <Button
                            icon={mdiChevronDoubleRight}
                            iconSide={"right"}
                            onClick={() => navigate("editor")}
                            iconSize={1.25}
                            className="float-right"
                        >
                            <div className={"px-2 py-1 text-xl"}>Open BLCC</div>
                        </Button>
                    </div>
                    <div className={"mt-16 flex flex-col items-center"}>
                        <div className="mb-16 flex flex-row items-center">
                            <Logo
                                className={"mx-8 h-52 w-full cursor-pointer select-none"}
                                onClick={() => navigate("/editor")}
                            />
                            <span className="text-lg text-[#9B9B9B]">BETA</span>
                        </div>
                        <div className="flex w-full flex-col flex-wrap items-center bg-blue-200 px-16 py-8">
                            <Title className="flex-grow">Features</Title>
                            <div className="flex w-full flex-row flex-wrap justify-center">
                                <FeaturesCard
                                    image={analysisUrl}
                                    headerText="New Capabilities"
                                    line1="Everything BLCC 5.3 can do and more"
                                    line2="In-tool results analysis"
                                    alt="Microscope"
                                />
                                <FeaturesCard
                                    image={clickUrl}
                                    headerText="Better User Experience"
                                    line1="Easier to use interface"
                                    line2="Better reporting documents"
                                    alt="Mouse button clicking"
                                />
                                <FeaturesCard
                                    image={lockUrl}
                                    headerText="Security"
                                    line1="No software installation"
                                    line2="No data saved or stored in cloud, uses AWS (which is FedRAMP certified)"
                                    alt="A lock"
                                />
                                <FeaturesCard
                                    image={bookUrl}
                                    headerText="User Resources"
                                    line1="Includes Handbook 135, Annual Supplement to Handbook 135, EERC, BLCC User Guide, BLCC FAQ, Training"
                                    alt="A book"
                                />
                            </div>
                        </div>
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
                                                className={"text-primary-dark underline visited:text-visited"}
                                                href={"https://pages.nist.gov/eerc/"}
                                            >
                                                EERC
                                            </a>
                                            )
                                        </li>
                                        <li>
                                            •{" "}
                                            <a
                                                className={"text-primary-dark underline visited:text-visited"}
                                                href={"https://doi.org/10.6028/NIST.HB.135e2025"}
                                            >
                                                Handbook 135
                                            </a>
                                        </li>
                                        <li>
                                            •{" "}
                                            <a
                                                className={"text-primary-dark underline visited:text-visited"}
                                                href={"https://doi.org/10.6028/NIST.IR.85-3273-40"}
                                            >
                                                Annual Supplement to Handbook 135
                                            </a>
                                        </li>
                                        <li>
                                            •{" "}
                                            <a
                                                className={"text-primary-dark underline visited:text-visited"}
                                                href={"https://doi.org/10.18434/mds2-3848"}
                                            >
                                                Data Tables for Annual Supplement
                                            </a>
                                        </li>
                                    </ul>
                                    All these resources can be found at the DOE FEMP{" "}
                                    <a
                                        className={"text-primary-dark underline visited:text-visited"}
                                        href={"https://www.energy.gov/femp/building-life-cycle-cost-programs"}
                                    >
                                        BLCC Program Page
                                    </a>
                                    .
                                </span>
                            </div>
                        </div>
                        <div className={"bg-primary-dark p-10 text-center text-white text-xs"}>
                            <p>
                                This software was developed at the National Institute of Standards and Technology by
                                employees of the Federal Government in the course of their official duties. Pursuant to
                                title 17 Section 105 of the United States Code this software is not subject to copyright
                                protection and is in the public domain. It is an experimental system. NIST assumes no
                                responsibility whatsoever for its use by other parties, and makes no guarantees,
                                expressed or implied, about its quality, reliability, or any other characteristic. We
                                would appreciate acknowledgement if the software is used. This software can be
                                redistributed and/or modified freely provided that any derivative works bear some notice
                                that they are derived from it, and any modified versions bear some notice that they have
                                been modified.
                            </p>
                            <Nbsp />
                            <p>Version {version}</p>
                        </div>
                    </div>
                </NistHeaderFooter>
            </div>
        </div>
    );
}
