/*
Copyright 2015-2024 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from "react";
import { CryptoEvent, MatrixClient } from "matrix-js-sdk/src/matrix";

import { messageForSyncError } from "../../../utils/ErrorUtils";
import Spinner from "../../views/elements/Spinner";
import ProgressBar from "../../views/elements/ProgressBar";
import AccessibleButton, { ButtonEvent } from "../../views/elements/AccessibleButton";
import { _t } from "../../../languageHandler";
import { useTypedEventEmitterState } from "../../../hooks/useEventEmitter";
import SdkConfig from "../../../SdkConfig";

import AuthPage from "../../views/auth/AuthPage";
import ServerPicker from "../../views/elements/ServerPicker";
import AuthBody from "../../views/auth/AuthBody";
import AuthHeader from "../../views/auth/AuthHeader";


interface Props {

};

/**
 * The view that is displayed after we have logged in, before the first /sync is completed.
 */
export function LoginSsoView(props: Props): React.JSX.Element {
    const ssoClick = (e) => {
        e.preventDefault();
        // window.open("#/start_sso")
        window.location.href = "#/start_sso";
        console.log('The link sso was clicked.');
    }
    const loginClick = (e) => {
        e.preventDefault();
        window.location.href = "#/login";
        console.log('The link  was clicked.');
    }

    const registerClick = (e) => {
        e.preventDefault();
        window.location.href = "#/register";
        console.log('The link  was clicked.');
    }
    
    let footer;
    footer = (
    <span className="mx_AuthBody_changeFlow">
        {_t(
            "auth|create_account_prompt",
            {},
            {
                a: (sub) => (
                    <AccessibleButton kind="link_inline" onClick={registerClick}>
                        {sub}
                    </AccessibleButton>
                ),
            },
        )}
    </span>
    );

    return (
        <AuthPage>
            <AuthHeader />
            <AuthBody>
                <h1>
                    {_t("common|welcome")}
                </h1>
                <button
                    className="mx_Login_submit"
                    onClick={ssoClick}
                >{_t("action|sign_in_private_line_sso")}</button>
                <h2 className="mx_AuthBody_centered mx_AuthBody_or_centered">
                    {_t("auth|sso_or_username_password", {
                        ssoButtons: "",
                        usernamePassword: "",
                    }).trim()}
                </h2>
                <button
                    className="mx_Login_submit"
                    onClick={loginClick}
                >{_t("action|sign_in_separate_account")}</button>
                {footer}
            </AuthBody>
        </AuthPage>
    );
}
