import React from "react";
import { IconButton } from "@webiny/ui/Button";
import { ReactComponent as MenuIcon } from "./hamburger.svg";
import { useNavigation } from "./index";

const Hamburger = () => {
    const [value, setValue] = useNavigation();
    
    return (
        <IconButton
            icon={<MenuIcon style={{ color: "white" }} />}
            onClick={() => setValue(!value)}
            data-testid={"apps-menu"}
        />
    );
};

export default Hamburger;
