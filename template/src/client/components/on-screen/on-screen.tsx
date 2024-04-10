import React from 'react';
import { ButtonGear, GearLabel } from './on-screen.styles';
import Gear from './gear.svg';
import {
  useAppSettingsShell,
  useSiteStructureStore,
} from '@quantumart/qp8-widget-platform-shell-core';
import { IAppSettingsShell } from 'src/share/app-settings-shell';
import { createPortal } from 'react-dom';

const OnScreen = (): JSX.Element | null => {
  const siteStructure = useSiteStructureStore();
  const appSettingsShell = useAppSettingsShell() as IAppSettingsShell;
  const gearRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState<boolean>(false);

  React.useEffect(() => {
    setActive(!!appSettingsShell.onScreen?.active);
  }, []);

  React.useEffect(() => {
    if (!gearRef.current) {
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const customerCode = urlParams.get('customerCode');
    const siteId = urlParams.get('site_id');
    const backendSid = urlParams.get('backend_sid');

    if (!backendSid) {
      setActive(false);
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
      window.onScreenAdminBaseUrl = onScreen.adminSiteBaseUrl.slice(
        0,
        onScreen.adminSiteBaseUrl.length - 1,
      );
      window.customerCode = customerCode;
      window.startPageId = siteStructure.structure?.id;
      window.siteId = siteId;
      window.isStage = onScreen.isStage;
      window.onScreenFeatures = onScreen.availableFeatures.join(', ');
      window.onScreenBackendSid = backendSid;
      window.onScreenOverrideAbTestStageModeCookieName = onScreen.overrideAbTestStageModeCookieName;
      window.onScreenMutationWatcherElementId = onScreen.mutationWatcherElementId;
      //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
      const onScreenScriptSrcs = [
        `${onScreen.adminSiteBaseUrl}dist/pmrpc.js`,
        `${onScreen.adminSiteBaseUrl}dist/vendor.js`,
        `${onScreen.adminSiteBaseUrl}dist/main.js`,
      ];
      const scripts = Array.from(document.getElementsByTagName('script')).map(e => e.src);
      for (const scriptSrc of onScreenScriptSrcs) {
        if (!scripts.includes(scriptSrc)) {
          const element = document.createElement('script');
          element.src = scriptSrc;
          element.type = 'text/javascript';
          element.async = false;
          element.defer = true;
          document.head.appendChild(element);
        }
      }
    })();
  }, [active, gearRef.current]);

  if (active) {
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
  }
  return null;
};

export default OnScreen;
