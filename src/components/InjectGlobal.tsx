import { injectGlobal } from "@emotion/css";
import { useTheme } from "@mutualzz/ui-web";
import { observer } from "mobx-react";
import { useEffect } from "react";

export const InjectGlobal = observer(() => {
    const { theme } = useTheme();

    useEffect(() => {
        injectGlobal`
            p {
                padding-inline-start: 0 !important;
                padding-inline-end: 0 !important;
                margin: 0;
            }

            ul,
            menu,
            dir {
                display: block;
                list-style-type: disc;
                margin-block-start: 0 !important;
                margin-block-end: 0 !important;
                padding-inline-start: ${theme.spacing(6)} !important;
            }

            ol {
                display: block;
                list-style-type: decimal;
                margin-block-start: 0 !important;
                margin-block-end: 0 !important;
                padding-inline-start: ${theme.spacing(6)} !important;
            }
        `;
    }, [theme]);

    return null;
});
