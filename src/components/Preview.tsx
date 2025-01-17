import { FC, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { db, auth } from "@/app/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import github from "../../public/assets/github2.svg";
import youtube from "../../public/assets/youtube2.svg";
import arrow from "../../public/assets/arrow.svg";
import facebook from "../../public/assets/facebook.svg";
import linkedin from "../../public/assets/linkedin.svg";

interface Link {
  platform: string;
  url: string;
}

interface PreviewProps {
  links: Link[];
  profilePicture: string | null;
  email: string | null;
}

const platformImages: Record<string, string> = {
  GitHub: github,
  LinkedIn: linkedin,
  YouTube: youtube,
  Facebook: facebook,
};

const Preview: FC<PreviewProps> = ({ links, profilePicture, email }) => {
  const [user, loading, error] = useAuthState(auth);
  const [profileData, setProfileData] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    profilePicture?: string;
  }>({});

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const docRef = doc(db, "profiles", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfileData(docSnap.data() as any);
        }
      };
      fetchProfile();
    }
  }, [user]);
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin border-[2px] rounded-full h-20 w-20 border-[#633CFF] relative"> <span className='rounded-full absolute top-0 right-0 border w-5 h-5 bg-black border-black'></span></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center flex flex-col items-center justify-center min-h-screen">
        <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin border-[2px] rounded-full h-20 w-20 border-[#633CFF] relative"> <span className='rounded-full absolute top-0 right-0 border w-5 h-5 bg-black border-black'></span></div>
      </div>

        <p className="text-gray-700 mt-4">Please log in to continue.</p>

        <Link href="/login" legacyBehavior>
          <p className="text-[#b32828] underline mt-2 font-medium">
            Go to Login Page
          </p>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative bg-white sm:bg-primary min-h-screen w-full">
      <div className="relative flex flex-col gap-[60px] lg:gap-[106px] sm:gap-[126px] z-10">
        <div className="w-full top-0 sm:px-6 sm:py-4">
          <nav className="px-6 py-4 rounded-xl bg-white w-full flex justify-center gap-4 sm:gap-0 sm:justify-between items-center">
            <Link href="/" legacyBehavior>
              <p className="rounded-lg text-secondary sm:w-fit  w-full border border-secondary bg-white sm:px-[27px] px-3 text-center py-[11px]">
                Back to Editor
              </p>
            </Link>
            <button className="rounded-lg text-white border sm:w-fit w-full border-secondary bg-secondary px-[40.5px] sm:px-[27px] py-[11px]">
              Share Link
            </button>
          </nav>
        </div>
        <div className="w-full flex justify-center items-center">
          <div className="h-fit w-[307px] rounded-3xl bg-white flex flex-col py-12 gap-14 items-center">
            <div className="flex flex-col gap-[25px] items-center">
              {profilePicture ? (
                <div className="relative">
                  <Image
                    src={profilePicture}
                    alt="Profile Picture"
                    priority
                    className="w-[7rem] h-[7rem] rounded-full border-4 border-secondary object-cover"
                    width={100}
                    height={100}
                  />
                </div>
              ) : (
                <div className="rounded-full w-[7rem] h-[7rem] content-none bg-dark mx-[5rem] top-[4rem] left-0" />
              )}
              <div className="flex flex-col gap-[13px] items-center">
                {profileData.firstName && profileData.lastName && (
                  <div className="text-black fnt-bold text-[32px] mt-2">
                    {profileData.firstName} {profileData.lastName}
                  </div>
                )}
                {email && (
                  <div className="text-dark-gray text-base mt-2">{email}</div>
                )}
              </div>
            </div>
            <div className="w-full flex flex-col gap-4">
              {links.map((link, index) => (
                <Link
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between gap-2 p-4 border border-gray-300 text-white rounded-lg hover:bg-gray-100 mx-5 ${
                    link.platform === "GitHub"
                      ? "bg-[#1A1A1A]"
                      : link.platform === "LinkedIn"
                        ? "bg-[#2D68FF]"
                        : link.platform === "YouTube"
                          ? "bg-red"
                          : "bg-dark"
                  }`}
                >
                  <div className="flex items-center gap-2">
                  <Image
                    src={platformImages[link.platform]}
                    alt={link.platform}
                    width={20}
                    height={20}
                  />
                  <span className="text-white text-sm">
                    {link.platform}
                  </span>
                  </div>
                  <Image src={arrow} alt="arrow" className="mx-2" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="sm:flex flex-col gap-[106px] hidden h-[357px] absolute top-0 z-0 p-6 bg-secondary w-full rounded-b-[32px]"></div>
    </div>
  );
};

export default Preview;
