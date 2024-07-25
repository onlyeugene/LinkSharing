'use client';
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import MainLayout from '../mainlayout';
import upload from '../../../../public/assets/upload.svg';
import change from '../../../../public/assets/change.svg';
import { db, auth, storage } from '@/app/firebase/config';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { toast, Toaster } from 'react-hot-toast';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
}

interface UserLink {
  id: string;
  userId: string;
  platform: string;
  url: string;
}

const DesktopPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [links, setLinks] = useState<UserLink[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const docRef = doc(db, 'profiles', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const profileData = docSnap.data() as FormData & {
            imageUrl?: string;
          };
          setValue('firstName', profileData.firstName);
          setValue('lastName', profileData.lastName);
          setValue('email', profileData.email);
          setProfilePicture(profileData.imageUrl || null);
          setFirstName(profileData.firstName || '');
          setLastName(profileData.lastName || '');
          setEmail(profileData.email || '');
        }
      };

      const fetchLinks = async () => {
        const linksRef = collection(db, 'links');
        const q = query(linksRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const userLinks: UserLink[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          userLinks.push({ id: doc.id, ...data } as UserLink);
        });
        setLinks(userLinks);
      };

      fetchProfile();
      fetchLinks();
    }
  }, [user, setValue]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onSubmit = async (data: FormData) => {
    if (user) {
      try {
        let imageUrl: string | undefined;
        if (selectedFile) {
          const imageRef = ref(storage, `profile_images/${user.uid}`);
          await uploadBytes(imageRef, selectedFile);
          imageUrl = await getDownloadURL(imageRef);
        }

        await setDoc(doc(db, 'profiles', user.uid), {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          imageUrl,
        });

        setFirstName(data.firstName);
        setLastName(data.lastName);
        setEmail(data.email);
        setProfilePicture(imageUrl || profilePicture);

        toast.success('Profile updated successfully!');
      } catch (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile.');
      }
    }
  };

  return (
    <div className="lg:flex sm:px-0 lg:py-0 sm:py-1 py-4 px-[1rem] justify-center bg-primary">
      <MainLayout
        profilePicture={profilePicture || undefined}
        firstName={firstName}
        lastName={lastName}
        email={email}
        links={links}
      />
      <div className="sm:my-[4rem] my-[1rem] sm:mx-5 w-full px-8 py-6 bg-white shadow-md rounded-lg relative">
        <div className='border-b absolute border-[#D9D9D9] bottom-[8rem] left-0 w-[100%] overflow-hidden' />
        <h1 className="text-black sm:text-[32px] text-2xl font-bold">Profile Details</h1>
        <h2 className="text-dark-gray text-base mt-2">
          Add your details to create a personal touch to your profile
        </h2>
        <div className="flex sm:flex-row flex-col border mt-[2rem] rounded-md border-primary bg-primary py-[2rem] px-[1rem] sm:gap-[5rem] gap-[2rem] sm:items-center items-start justify-between">
          <h3 className="text-base text-dark-gray">Profile picture</h3>
          <div className="flex sm:flex-row flex-col sm:items-center items-start gap-10">
            <div
              className="border border-purple bg-purple sm:py-[1rem] py-[3rem] sm:px-[2rem] px-[1.5rem] rounded-md flex flex-col items-center cursor-pointer"
              onClick={handleUploadClick}
              style={{
                backgroundImage: selectedFile ? `url(${profilePicture})` : ``,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <Image
                src={selectedFile ? change : upload}
                alt={selectedFile ? "change" : "upload"}
                className="mb-2"
              />
              <h4 className={`font-semibold ${selectedFile ? 'text-white' : 'text-secondary'}`}>
                {selectedFile ? 'Change Image' : '+ Upload Image'}
              </h4>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
                accept="image/png, image/jpeg"
              />
            </div>
            <h5 className="text-xs text-dark-gray">
              Image must be below 1024x1024px.<br className='sm:block hidden' />Use PNG <br className='sm:hidden block' /> or JPG format.
            </h5>
          </div>
        </div>
        {selectedFile && (
          <div className="mt-4 text-dark-gray">
            <p>Selected file: {selectedFile.name}</p>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="border mt-[2rem] rounded-md border-primary py-[2rem] px-[1rem] flex flex-col gap-[.5rem] bg-primary items-center">
            <div className="sm:flex gap-[1rem] w-full relative">
              <label
                htmlFor="firstName"
                className="w-full text-dark-gray sm:text-base text-xs"
              >
                First name*
              </label>
              <input
                type="text"
                placeholder="e.g John"
                {...register("firstName", { required: "Can't be empty" })}
                className="w-full rounded-md py-2 border px-[.7rem] border-light-gray text-base outline-none font-normal text-black"
              />
              {errors.firstName && (
                <span className="text-red-500 absolute top-3 px-4 right-0 text-xs">{errors.firstName.message}</span>
              )}
            </div>
            <div className="sm:flex gap-[1rem] w-full relative">
              <label
                htmlFor="lastName"
                className="w-full text-dark-gray sm:text-base text-xs"
              >
                Last name*
              </label>
              <input
                type="text"
                placeholder="e.g Appleseed"
                {...register("lastName", { required: "Can't be empty" })}
                className="w-full rounded-md py-2 border px-[.7rem] border-light-gray text-base outline-none text-black"
              />
              {errors.lastName && (
                <span className="text-red-500 absolute top-3 px-4 right-0 text-xs">{errors.lastName.message}</span>
              )}
            </div>
            <div className="sm:flex gap-[1rem] w-full relative">
              <label
                htmlFor="email"
                className="w-full text-dark-gray sm:text-base text-xs"
              >
                Email
              </label>
              <input
                type="text"
                placeholder="e.g email@example.com"
                {...register("email", {
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
                className="w-full rounded-md py-2 border px-[.7rem] border-light-gray text-base outline-none text-black"
              />
              {errors.email && (
                <span className="text-red-500 absolute top-3 px-4 right-0 text-xs">{errors.email.message}</span>
              )}
            </div>
          </div>
          <div className='w-full text-right'>
            <button
              type="submit"
              className="sm:w-[7rem] w-full border py-2 px-7 mt-[5rem] border-t rounded-md text-white bg-secondary"
            >
              Save
            </button>
          </div>
        </form>
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    </div>
  );
};

export default DesktopPage;
