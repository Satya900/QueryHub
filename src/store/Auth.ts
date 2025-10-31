import { create } from "zustand";
import {immer} from "zustand/middleware/immer"
import { persist } from "zustand/middleware"

import { AppwriteException, ID, Models  } from "appwrite"
import { account } from "@/models/client/config";
import { generateProfileUrl } from "@/utils/profileUrl";

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
        error? : AppwriteException | null;
        profileUrl?: string | null;
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
    redirectToProfile(): string | null;

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
                    
                    try {
                        const profileUrl = generateProfileUrl(user.$id, user.name);
                        return { success: true, profileUrl };
                    } catch (profileError) {
                        console.error('Profile URL generation failed:', profileError);
                        return { success: true, profileUrl: null };
                    }
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
            },

            redirectToProfile() {
                try {
                    const currentUser = this.user;
                    if (!currentUser) return null;
                    return generateProfileUrl(currentUser.$id, currentUser.name);
                } catch (error) {
                    console.error('Profile URL generation error:', error);
                    return null;
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