"use client"

import { useAuthStore } from "@/store/Auth";
import { useRouter } from "next/navigation";
import { generateProfileUrl } from "@/utils/profileUrl";
import React from "react"

const Layout = ({children} : {children: React.ReactNode}) => {
  const {session, user} = useAuthStore();
  const router = useRouter();

  React.useEffect(()=>{
    if(session && user){
        const attemptRedirection = async () => {
            try {
                const profileUrl = generateProfileUrl(user.$id, user.name);
                router.push(profileUrl);
            } catch (profileError) {
                console.error('Profile redirection failed:', profileError, { userId: user.$id, userName: user.name });
                
                try {
                    router.push("/questions");
                } catch (questionsError) {
                    console.error('Questions page redirection failed:', questionsError);
                    
                    try {
                        router.push("/");
                    } catch (homeError) {
                        console.error('Home page redirection failed:', homeError);
                    }
                }
            }
        };
        
        attemptRedirection();
    }
  }, [session, user, router])

    if(session){
        return null;
    }

    return(
        <div className="">
            <div className="">{children}</div>
        </div>
    )
};

export default Layout;
