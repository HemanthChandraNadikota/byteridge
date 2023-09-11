import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { alertActions } from '_store';
import { history, fetchWrapper } from '_helpers';

// create slice

const name = 'auth';
const initialState = createInitialState();
const reducers = createReducers();
const extraActions = createExtraActions();
const slice = createSlice({ name, initialState, reducers });

// exports

export const authActions = { ...slice.actions, ...extraActions };
export const authReducer = slice.reducer;

// implementation

function createInitialState() {
    return {
        // initialize state from local storage to enable user to stay logged in
        value: JSON.parse(localStorage.getItem('auth'))
    }
}

function createReducers() {
    return {
        setAuth
    };

    function setAuth(state, action) {
        state.value = action.payload;
    }
}

function createExtraActions() {
    const baseUrl = `${process.env.REACT_APP_API_URL}/users`;

    return {
        login: login(),
        logout: logout()
    };

    function login() {
        return createAsyncThunk(
            `${name}/login`,
            async function ({ username, password,navigate }, { dispatch }) {
                dispatch(alertActions.clear());
                try {
                    const user = await fetchWrapper.post(`${baseUrl}/authenticate`, { username, password });

                    // set auth user in redux state
                    dispatch(authActions.setAuth(user));

                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('auth', JSON.stringify(user));
                    console.log(user.role)
                    if (user.role === 'Auditor') {
                        navigate('/users/audit');
                    } else {
                        navigate('/');
                    }
                } catch (error) {
                    dispatch(alertActions.error(error));
                }
            }
        );
    }

    function logout() {
        return createAsyncThunk(
            `${name}/logout`,
            async function (arg, { dispatch }) {
                const logId = JSON.parse(localStorage.getItem('auth')).logid
                await fetchWrapper.post(`${baseUrl}/logout`,{ logId: logId });
                dispatch(authActions.setAuth(null));
                localStorage.removeItem('auth');
                history.navigate('/account/login');
            }
        );
    }
}