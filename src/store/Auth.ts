/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from "zustand";
import {immer} from "zustand/middleware/immer"
import { persist } from "zustand/middleware"

import { AppwriteException, ID, Models  } from "appwrite"
import { account } from "@/models/client/config";

export interface UserPrefs {
    reputation: number
}

interface IAuthStore {
    session: Models.Session | null
    jwt: string | null
    user: Models.User<UserPrefs> | null
    hydrated: boolean

    setHydrated(): void;
    verifySession(): Promise<void>;
    login(
        email: string,
        password: string
    ): Promise<
    {
        success: boolean;
        error? : AppwriteException | null
    }>;

    createAccount(
        name:string,
        email: string,
        password: string
    ): Promise<
    {
        success: boolean;
        error? : AppwriteException | null
    }
    >;
    logout(): Promise<void>;

}


export const useAuthStore = create<IAuthStore>()(
    persist(
        immer((set)=>({
            session: null,
            jwt: null,
            user: null,
            hydrated: false,
            setHydrated() {
                set({
                    hydrated: true
                })
            },
            async verifySession(){
                try {
                    const session = await account.getSession({
                        sessionId: 'current'
                    })
                    set({session})

                } catch (error) {
                    console.log(error);
                }
            },

            async login(email: string, password: string){
                try {
                    const session = await account.createEmailPasswordSession({
                        email: email,
                        password: password,
                    })
                    const [user, {jwt}] = await Promise.all([
                        account.get<UserPrefs>(),
                        account.createJWT()
                    ])
                    if(!user.prefs?.reputation){
                        await account.updatePrefs({
                            prefs: {
                                reputation: 0
                            }
                        })
                    }
                    set({ session, user, jwt })
                    return { success: true }
                } catch (error) {
                    return { success: false, error: error as AppwriteException }
                }
            },

            async createAccount(name: string, email: string, password: string){
                try {
                    await account.create({
                        userId: ID.unique(),
                        email,
                        password,
                        name
                    })
                    return { success: true }
                } catch (error) {
                    return { success: false, error: error as AppwriteException }
                }
            },

            async logout(){
                try {
                    await account.deleteSessions()
                    set({ session: null, user: null, jwt: null })
                } catch (error) {
                    console.error('Logout error:', error)
                }
            }
        })),
        {
            name: "auth",
            onRehydrateStorage(){
                return (state, error)=>{
                    if(!error) state?.setHydrated()
                }
            },
        }
    )
)