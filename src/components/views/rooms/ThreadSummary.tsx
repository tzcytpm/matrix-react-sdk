/*
Copyright 2022 The Matrix.org Foundation C.I.C.

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

import React, { useContext, useState } from "react";
import { Thread, ThreadEvent, IContent, MatrixEvent, MatrixEventEvent } from "matrix-js-sdk/src/matrix";
import { IndicatorIcon } from "@vector-im/compound-web";
import { Icon as ThreadIconSolid } from "@vector-im/compound-design-tokens/icons/threads-solid.svg";

import { _t } from "../../../languageHandler";
import { CardContext } from "../right_panel/context";
import AccessibleButton, { ButtonEvent } from "../elements/AccessibleButton";
import { useTypedEventEmitter, useTypedEventEmitterState } from "../../../hooks/useEventEmitter";
import RoomContext from "../../../contexts/RoomContext";
import { MessagePreviewStore } from "../../../stores/room-list/MessagePreviewStore";
import MemberAvatar from "../avatars/MemberAvatar";
import { useAsyncMemo } from "../../../hooks/useAsyncMemo";
import MatrixClientContext from "../../../contexts/MatrixClientContext";
import { Action } from "../../../dispatcher/actions";
import { ShowThreadPayload } from "../../../dispatcher/payloads/ShowThreadPayload";
import defaultDispatcher from "../../../dispatcher/dispatcher";
import { useUnreadNotifications } from "../../../hooks/useUnreadNotifications";
import { notificationLevelToIndicator } from "../../../utils/notifications";

interface IProps {
    mxEvent: MatrixEvent;
    thread: Thread;
}

const ThreadSummary: React.FC<IProps> = ({ mxEvent, thread, ...props }) => {
    const roomContext = useContext(RoomContext);
    const cardContext = useContext(CardContext);
    const count = useTypedEventEmitterState(thread, ThreadEvent.Update, () => thread.length);
    const { level } = useUnreadNotifications(thread.room, thread.id);

    if (!count) return null; // We don't want to show a thread summary if the thread doesn't have replies yet

    let countSection: string | number = count;
    if (!roomContext.narrow) {
        countSection = _t("threads|count_of_reply", { count });
    }

    return (
        <AccessibleButton
            {...props}
            className="mx_ThreadSummary"
            onClick={(ev: ButtonEvent) => {
                defaultDispatcher.dispatch<ShowThreadPayload>({
                    action: Action.ShowThread,
                    rootEvent: mxEvent,
                    push: cardContext.isCard,
                });
            }}
            aria-label={_t("threads|open_thread")}
        >
            <IndicatorIcon size="24px" indicator={notificationLevelToIndicator(level)}>
                <ThreadIconSolid />
            </IndicatorIcon>
            <span className="mx_ThreadSummary_replies_amount">{countSection}</span>
            <ThreadMessagePreview thread={thread} showDisplayname={!roomContext.narrow} />
            <div className="mx_ThreadSummary_chevron" />
        </AccessibleButton>
    );
};

interface IPreviewProps {
    thread: Thread;
    showDisplayname?: boolean;
}

export const ThreadMessagePreview: React.FC<IPreviewProps> = ({ thread, showDisplayname = false }) => {
    const cli = useContext(MatrixClientContext);

    const lastReply = useTypedEventEmitterState(thread, ThreadEvent.Update, () => thread.replyToEvent) ?? undefined;
    // track the content as a means to regenerate the thread message preview upon edits & decryption
    const [content, setContent] = useState<IContent | undefined>(lastReply?.getContent());
    useTypedEventEmitter(lastReply, MatrixEventEvent.Replaced, () => {
        setContent(lastReply!.getContent());
    });
    const awaitDecryption = lastReply?.shouldAttemptDecryption() || lastReply?.isBeingDecrypted();
    useTypedEventEmitter(awaitDecryption ? lastReply : undefined, MatrixEventEvent.Decrypted, () => {
        setContent(lastReply!.getContent());
    });

    const preview = useAsyncMemo(async (): Promise<string | undefined> => {
        if (!lastReply) return;
        await cli.decryptEventIfNeeded(lastReply);
        return MessagePreviewStore.instance.generatePreviewForEvent(lastReply);
    }, [lastReply, content]);
    if (!preview || !lastReply) {
        return null;
    }

    return (
        <>
            <MemberAvatar
                member={lastReply.sender}
                fallbackUserId={lastReply.getSender()}
                size="24px"
                className="mx_ThreadSummary_avatar"
            />
            {showDisplayname && (
                <div className="mx_ThreadSummary_sender">{lastReply.sender?.name ?? lastReply.getSender()}</div>
            )}

            {lastReply.isDecryptionFailure() ? (
                <div
                    className="mx_ThreadSummary_content mx_DecryptionFailureBody"
                    title={_t("threads|unable_to_decrypt")}
                >
                    <span className="mx_ThreadSummary_message-preview">{_t("threads|unable_to_decrypt")}</span>
                </div>
            ) : (
                <div className="mx_ThreadSummary_content" title={preview}>
                    <span className="mx_ThreadSummary_message-preview">{preview}</span>
                </div>
            )}
        </>
    );
};

export default ThreadSummary;
