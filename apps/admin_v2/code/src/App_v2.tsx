import React from "react";
import { Admin } from "@webiny/admin/v2";

import "./App.scss";
import { withNavigation } from "./extensions_v2/navigation";
import { setupComponents } from "./extensions_v2/components";

export const App = () => {
    return <Admin modules={[setupComponents(), withNavigation({ title: "Webiny Enhanced" })]} />;
};
