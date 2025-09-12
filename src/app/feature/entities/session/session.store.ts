import {signalStore, withHooks, withMethods, withState} from '@ngrx/signals';
import {withDevtools} from '@angular-architects/ngrx-toolkit';
import {SessionService} from '@chd-digital-verbatim-front/feature/entities/session/session.service';
import {inject} from '@angular/core';

export const SESSION_STORE = 'session-store';

type SessionState = {
  loading: boolean;
  error: unknown | null;
};

const initialState: SessionState = {
  loading: false,
  error: null,
};

export const SessionStore = signalStore(
  {providedIn: 'root'},
  withDevtools(SESSION_STORE),
  withState({...initialState}),

  withMethods((store, sessionService = inject(SessionService)) => ({})),

  withHooks({
    onInit(store) {
    },
  }),
);

export type SessionStore = InstanceType<typeof SessionStore>;
