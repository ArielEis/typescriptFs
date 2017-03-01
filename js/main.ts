"use strict";

import { UserInterface } from "./ui";

(function () {

    $(document).ready(function () {
        UserInterface.initialContextMenuOptions();
        UserInterface.initializeTopBar();
        UserInterface.initializeBrowser();
        UserInterface.initializeContent();
    });

}());