import { BrowserRouter, Route, Routes } from "react-router-dom";
import EditorAppBar from "./components/EditorAppBar";
import ResultsAppBar from "./components/ResultsAppBar";
import Navigation from "./components/Navigation";
import GeneralInformation from "./pages/editor/GeneralInformation";
import Alternatives from "./pages/editor/Alternatives";
import React from "react";
import Cost from "./pages/editor/Cost";
import AlternativeSummary from "./pages/editor/AlternativeSummary";
import Statistics from "./components/Statistics";
import CostNavigation from "./components/CostNavigation";
import ResultNavigation from "./components/ResultNavigation";
import Inputs from "./pages/results/Inputs";
import Summary from "./pages/results/Summary";
import AlternativeResults from "./pages/results/AlternativeResults";
import AnnualResults from "./pages/results/AnnualResults";

import { Layout } from "antd";

const { Header, Footer, Sider, Content } = Layout;

const headerStyle: React.CSSProperties = {
    lineHeight: "0",
    height: "fit-content",
    padding: "0",
    backgroundColor: "rgb(169 174 177 / var(--tw-bg-opacity))"
};

const siderStyle: React.CSSProperties = {
    backgroundColor: "rgb(169 174 177 / var(--tw-bg-opacity))"
};

export default function App() {
    return (
        <BrowserRouter>
            <Layout>
                {/* App bars */}
                <Header style={headerStyle}>
                    <Routes>
                        <Route path={"/editor/*"} element={<EditorAppBar />} />
                        <Route path={"/results/*"} element={<ResultsAppBar />} />
                    </Routes>
                </Header>

                <Layout hasSider>
                    {/* Navigation */}
                    <Sider style={siderStyle}>
                        <Routes>
                            <Route path={"/editor"} element={<Navigation />}>
                                <Route path={"alternative/*"} element={<CostNavigation />} />
                            </Route>
                            <Route path={"/results"} element={<ResultNavigation />} />
                        </Routes>
                    </Sider>

                    {/* Pages */}
                    <Content>
                        <Routes>
                            <Route path={"/editor"}>
                                <Route index element={<GeneralInformation />} />
                                <Route path={"alternative"}>
                                    <Route index element={<AlternativeSummary />} />
                                    <Route path={":alternativeID"} element={<Alternatives />} />
                                    <Route path={"cost/:costID"} element={<Cost />} />
                                </Route>
                            </Route>
                            <Route path={"/results"}>
                                <Route index element={<Inputs />} />
                                <Route path={"alternative"} element={<AlternativeResults />} />
                                <Route path={"annual"} element={<AnnualResults />} />
                                <Route path={"summary"} element={<Summary />} />
                            </Route>
                        </Routes>
                    </Content>
                </Layout>
                <Footer>
                    <Routes>
                        <Route path={"/editor/*"} element={<Statistics />} />
                    </Routes>
                </Footer>
            </Layout>
        </BrowserRouter>
    );
}
