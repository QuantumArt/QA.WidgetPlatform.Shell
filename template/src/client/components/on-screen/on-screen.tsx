import React from 'react';
import { ButtonGear, GearLabel } from './on-screen.styles';
import Gear from './gear.svg';
import {
  useAppSettingsShell,
  useSiteStructureStore,
} from '@quantumart/qp8-widget-platform-shell-core';
import { IAppSettingsShell } from 'src/share/app-settings-shell';
import { useAbstractItem } from '@quantumart/qp8-widget-platform-bridge';
import { createPortal } from 'react-dom';

const OnScreen = (): JSX.Element | null => {
  const siteStructure = useSiteStructureStore();
  const abstractItem = useAbstractItem();
  const appSettingsShell = useAppSettingsShell() as IAppSettingsShell;
  const active = !!appSettingsShell.onScreen?.active;
  const gearRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!gearRef.current) {
      return;
    }

    (async () => {
      const data = localStorage.getItem('persist:root');
      if (data) {
        const sidebar = JSON.parse(JSON.parse(data).sidebar);
        gearRef.current!.style.top = sidebar.cords.nodeY + 'px';
        gearRef.current!.style.left = sidebar.cords.nodeX + 'px';
      }
      gearRef.current!.style.opacity = '1';

      const onScreen = appSettingsShell.onScreen;
      //Параметры инициализация OnScreen админки
      window.onScreenAdminBaseUrl = onScreen.adminSiteBaseUrl;
      window.customerCode = onScreen.customerCode;
      window.currentPageId = abstractItem.id;
      window.startPageId = siteStructure.structure?.id;
      window.siteId = onScreen.siteId;
      window.isStage = onScreen.isStage;
      window.onScreenFeatures = onScreen.availableFeatures.join(', ');
      window.onScreenTokenCookieName = onScreen.authCookieName;
      window.onScreenOverrideAbTestStageModeCookieName = onScreen.overrideAbTestStageModeCookieName;
      //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

      const onScreenScriptSrcs = [
        `${onScreen.adminSiteBaseUrl}dist/pmrpc.js`,
        `${onScreen.adminSiteBaseUrl}dist/vendor.js`,
        `${onScreen.adminSiteBaseUrl}dist/main.js`,
      ];

      for (const scriptSrc of onScreenScriptSrcs) {
        const element = document.createElement('script');
        element.src = scriptSrc;
        element.type = 'text/javascript';
        element.async = false;
        element.defer = true;
        document.head.appendChild(element);
      }
    })();
  }, [gearRef.current]);

  if (!active || typeof window === 'undefined') {
    return null;
  }

  return createPortal(
    <>
      <ButtonGear ref={gearRef} id="fakeGear">
        <GearLabel>
          <Gear />
        </GearLabel>
      </ButtonGear>
      <div id="sidebarplaceholder" />
    </>,
    document.body,
  );
};

export default OnScreen;
