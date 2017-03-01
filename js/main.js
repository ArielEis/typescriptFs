"use strict";
var ui_1 = require("./ui");
(function () {
    $(document).ready(function () {
        ui_1.UserInterface.initialContextMenuOptions();
        ui_1.UserInterface.initializeTopBar();
        ui_1.UserInterface.initializeBrowser();
        ui_1.UserInterface.initializeContent();
    });
}());
//# sourceMappingURL=main.js.map