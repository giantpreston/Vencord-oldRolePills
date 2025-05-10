/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2025 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import definePlugin, { OptionType } from "@utils/types";
import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import { React } from "@webpack/common";  // Import React from the webpack common module
import { findByCodeLazy } from "@webpack"; // Correct import for module searching in Vencord

const settings = definePluginSettings({
    roleDotXAxisSize: {
        type: OptionType.SLIDER,
        description: "Set the Role dot's width (in pixels)",
        default: 4,
        markers: [1, 2, 4, 6, 8],
        stickToMarkers: false,
        restartNeeded: true
    },
    roleDotYAxisSize: {
        type: OptionType.SLIDER,
        description: "Set the Role dot's height (in pixels)",
        default: 4,
        markers: [1, 2, 4, 6, 8],
        stickToMarkers: false,
        restartNeeded: true
    }
});

export default definePlugin({
    name: "OldRolePills",
    description: "Reverts Discord's role pills to the 2020 style with colored outlines and smaller dots.",
    settings,
    authors: [Devs.GiantPreston, Devs.Kluckings, Devs.Bialy],

    start() {
        // Inject styles for old role pill appearance
        const style = document.createElement("style");
        style.id = "old-role-pills-style";
        style.textContent = `
            .old-role-pill {
                border: 1px solid currentColor !important;
                border-radius: 9999px !important;
                padding: 0 4px !important;
                background: transparent !important;
                display: inline-flex !important;
                align-items: center !important;
                gap: 4px !important;
            }
            .old-role-pill svg {
                width: 6px !important;
                height: 6px !important;
                margin-right: 4px !important;
            }
        `;
        document.head.appendChild(style);

        // Find the RolePill component and patch it
        const RolePillModule = findByCodeLazy((m) => m?.default?.displayName === "RolePill");

        if (RolePillModule) {
            console.log("RolePill module found:", RolePillModule);

            // Patch the module to apply the custom styles
            const { patchModule } = require("@webpack");
            if (patchModule) {
                patchModule("role-pills", RolePillModule, {
                    before: ({ props }) => {
                        console.log("Patching role pill with class:", props.className);
                        props.className += " old-role-pill";
                    },
                });
            }
        } else {
            console.log("RolePill module not found.");
        }

        // Function to update the role pill outline color
        function updateRolePills() {
            // Select all role pill elements (ensure we're not targeting remove buttons)
            const rolePills = document.querySelectorAll('[class^="role_"]:not([class*="roleRemoveButton"])');

        
            // Loop through each role pill and update its outline and color
            rolePills.forEach(pill => {
                // Try to get the role dot (assumed to be part of the pill)
                const roleDot = pill.querySelector('.roleCircle__4f569, .roleFlowerStar_dfa8b6');
        
                if (roleDot) {
                    // Get the computed styles of the role dot to capture its exact color
                    const computedStyle = window.getComputedStyle(roleDot);
                    const dotColor = computedStyle.backgroundColor || computedStyle.color;
        
                    // Apply the color to the role pill's border and text color
                    pill.style.border = `1px solid ${dotColor}`;  // Set border to role dot color
                    pill.style.color = dotColor;  // Set text color to role dot color
        
                    // Make the pill rounded (if it's not already) and ensure clean appearance
                    pill.style.borderRadius = '9999px';  // Max border-radius for pill shape
                    pill.style.padding = '0px 3px';  // Adjust horizontal padding for space and vertical padding for balance
                    pill.style.background = 'transparent';  // Keep background transparent
        
                    // Ensure there's a smaller space between the role dot and the text
                    const roleDotElement = pill.querySelector('svg');
                    if (roleDotElement) {
                        roleDotElement.style.marginRight = '0px';  // Smaller space between dot and text
        
                        // Make the dot smaller by reducing the width and height of the svg
                        roleDotElement.style.width = `${settings.store.roleDotXAxisSize}px`;  // Reduce dot size (adjust as necessary)
                        roleDotElement.style.height = `${settings.store.roleDotYAxisSize}px`; // Same for height
                    }
        
                    // If you're using flexbox (as the CSS suggests), apply a small gap between items
                    pill.style.display = 'inline-flex';  // Set display to inline-flex
                    pill.style.alignItems = 'center';  // Align items to the center
                    pill.style.gap = '0px';  // Smaller gap between the dot and text
                }
            });
        }

        // Create an observer to handle dynamically added role pills
        const observer = new MutationObserver(updateRolePills);

        // Start observing for changes to the body (for dynamically added roles)
        observer.observe(document.body, { childList: true, subtree: true });

        // Run the updateRolePills function initially to apply styles
        updateRolePills();
    },

    stop() {
        // Remove the injected styles on stop
        const style = document.getElementById("old-role-pills-style");
        if (style) style.remove();
    }
});
