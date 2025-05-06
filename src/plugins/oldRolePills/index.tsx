/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin from "@utils/types";
import { Devs } from "@utils/constants";

export default definePlugin({
    name: "OldRolePills",
    description: "Get Discord 2020-style role pills with colored outlines and smaller dots.",
    authors: [Devs.GiantPreston],

    start() {
        function updateRolePills() {
            const rolePills = document.querySelectorAll('[class^="role_"]:not([class*="roleRemoveButton"])');

            rolePills.forEach(pill => {
                const roleDot = pill.querySelector('.roleCircle__4f569, .roleFlowerStar_dfa8b6');
                if (!roleDot) return;

                const computedStyle = window.getComputedStyle(roleDot);
                const dotColor = computedStyle.backgroundColor || computedStyle.color;

                pill.style.border = `1px solid ${dotColor}`;
                pill.style.color = dotColor;
                pill.style.borderRadius = '9999px';
                pill.style.padding = '0px 3px';
                pill.style.background = 'transparent';

                const roleDotElement = pill.querySelector('svg');
                if (roleDotElement) {
                    roleDotElement.style.marginRight = '0px';
                    roleDotElement.style.width = '4px';
                    roleDotElement.style.height = '4px';
                }

                pill.style.display = 'inline-flex';
                pill.style.alignItems = 'center';
                pill.style.gap = '0px';
            });
        }

        updateRolePills();
        this._observer = new MutationObserver(updateRolePills);
        this._observer.observe(document.body, { childList: true, subtree: true });
    },

    stop() {
        this._observer?.disconnect();
    }
});
