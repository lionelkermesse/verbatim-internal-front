import {patchState, signalStore, withHooks, withMethods, withState} from '@ngrx/signals';
import {withDevtools} from '@angular-architects/ngrx-toolkit';
import {inject} from '@angular/core';
import {rxMethod} from '@ngrx/signals/rxjs-interop';
import {pipe, switchMap, tap} from 'rxjs';
import {tapResponse} from '@ngrx/operators';
import {distinctUntilChanged, map} from 'rxjs/operators';
import {ProfileService} from '@chd-digital-verbatim-front/feature/layouts/profiles/profile.service';
import {ProfileInfo} from '@chd-digital-verbatim-front/feature/layouts/profiles/profile-info.model';

export const PROFILE_INFO_STORE = 'profile-info-store';

type ProfileInfoState = {
  ribbonEnv: string | null;
  inProduction?: boolean,
  openAPIEnabled?: boolean,
  version: string;
  loading: boolean;
  error: unknown | null;
};

const initialState: ProfileInfoState = {
  ribbonEnv: '',
  version: '',
  inProduction: false,
  openAPIEnabled: false,
  loading: false,
  error: null,
};

export const ProfileInfoStore = signalStore(
  {providedIn: 'root'},
  withDevtools(PROFILE_INFO_STORE),
  withState({...initialState}),

  withMethods((store, profileService = inject(ProfileService)) => ({
    loadInfo: rxMethod(
      pipe(
        distinctUntilChanged(),
        tap(() => patchState(store, {loading: true, error: null})),
        switchMap(() => {
          return profileService.getInfo().pipe(
            tap(response => patchState(store, {version: response.build?.version ?? ''})),
            map(response => {
              const profileInfo: ProfileInfo = {
                activeProfiles: response.activeProfiles,
                inProduction: response.activeProfiles?.includes('prod'),
                openAPIEnabled: response.activeProfiles?.includes('api-docs'),
              };
              if (response.activeProfiles && response['display-ribbon-on-profiles']) {
                const displayRibbonOnProfiles = response['display-ribbon-on-profiles'].split(',');
                const ribbonProfiles = displayRibbonOnProfiles.filter(profile => response.activeProfiles?.includes(profile));
                if (ribbonProfiles.length > 0) {
                  profileInfo.ribbonEnv = ribbonProfiles[0];
                }
              }
              return profileInfo;
            }),
            tapResponse({
              next: (profileInfo: ProfileInfo) =>
                patchState(store, {
                  inProduction: profileInfo.inProduction,
                  openAPIEnabled: profileInfo.openAPIEnabled,
                  ribbonEnv: profileInfo.ribbonEnv ?? null,
                  loading: false,
                }),
              error(error: unknown) {
                patchState(store, {error, loading: false});
              },
            }),
          );
        }),
      ),
    ),
  })),

  withHooks({
    onInit(store) {
      store.loadInfo(undefined);
    },
  }),
);

export type ProfileInfoStore = InstanceType<typeof ProfileInfoStore>;
