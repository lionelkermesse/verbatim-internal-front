import {signalStore, withHooks, withMethods, withState} from '@ngrx/signals';
import {withDevtools} from '@angular-architects/ngrx-toolkit';
import {inject} from '@angular/core';
import {
  MatchingVersionService
} from '@chd-digital-verbatim-front/feature/entities/matching-version/matching-version.service';

export const MATCHING_VERSION_STORE = 'matching-version-store';

type MatchingVersionState = {
  loading: boolean;
  error: unknown | null;
};

const initialState: MatchingVersionState = {
  loading: false,
  error: null,
};

export const MatchingVersionStore = signalStore(
  {providedIn: 'root'},
  withDevtools(MATCHING_VERSION_STORE),
  withState({...initialState}),

  withMethods((store, matchingVersionService = inject(MatchingVersionService)) => ({})),

  withHooks({
    onInit(store) {
    },
  }),
);

export type MatchingVersionStore = InstanceType<typeof MatchingVersionStore>;
