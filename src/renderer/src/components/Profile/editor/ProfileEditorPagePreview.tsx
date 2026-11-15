import { ProfileBlockRenderer } from "@components/Profile/viewer/ProfileBlockRenderer";
import { ProfileCanvas } from "@components/Profile/shared/ProfileCanvas";
import { ProfileCanvasBlocksLayer } from "@components/Profile/shared/ProfileCanvasBlocksLayer";
import { ProfileCanvasViewport } from "@components/Profile/shared/ProfileCanvasViewport";
import { sortBlocksByZIndex } from "@components/Profile/viewer/profileLayout.utils";
import type { ProfileDraftState } from "@components/Profile/editor/utils/profileEditor.utils";
import type { AccountStore } from "@stores/Account.store";
import type { UserProfile } from "@stores/objects/UserProfile";
import { getProfilePageHeight, isProfileBlockOnlyMe } from "@mutualzz/ui-core";
import { observer } from "mobx-react-lite";

interface Props {
  profile: UserProfile;
  user: AccountStore;
  draft: ProfileDraftState;
  zoom: number;
}

export const ProfileEditorPagePreview = observer(
  ({ profile, user, draft, zoom }: Props) => (
    <ProfileCanvasViewport
      zoom={zoom}
      contentHeight={getProfilePageHeight(
        draft.blocks.filter((block) => !isProfileBlockOnlyMe(block))
      )}
    >
      <ProfileCanvas
        profile={profile}
        backgroundColorOverride={draft.backgroundColor}
        backgroundImageOverride={draft.backgroundImage}
        backgroundImageFitOverride={draft.backgroundImageFit}
        pageFontFamilyOverride={draft.pageFontFamily}
        themeOverride={draft.theme}
        displayNameStyleOverride={draft.displayNameStyle}
      >
        <ProfileCanvasBlocksLayer>
          {({ canvasRect }) =>
            sortBlocksByZIndex(
              draft.blocks.filter((block) => !isProfileBlockOnlyMe(block))
            ).map((block) => (
              <ProfileBlockRenderer
                key={block.id}
                block={block}
                canvas={canvasRect}
                profile={profile}
                user={user}
                bioOverride={draft.bio}
                pronounsOverride={draft.pronouns}
                bannerOverride={draft.banner}
                readOnly
              />
            ))
          }
        </ProfileCanvasBlocksLayer>
      </ProfileCanvas>
    </ProfileCanvasViewport>
  )
);
