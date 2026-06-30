"use client";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import SpotlightCard from "./SpotlightCard";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { supabaseBrowserClient, supabaseClient } from "@/configs/supabase";
import { v4 as uuidv4 } from "uuid";
import { Spinner } from "./ui/spinner";

const formSchema = (type: FormType) => {
  return z.object({
    name:
      type == "sign-in"
        ? z.string().optional()
        : z
            .string()
            .min(5, "Bug title must be at least 5 characters.")
            .max(32, "Bug title must be at most 32 characters."),
    email: z.string("Email is required"),
    password: z
      .string()
      .min(5, "Password must be at least 5 characters.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number.")
      .regex(
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/,
        "Password must contain at least one special character.",
      ),
  });
};
const Authform = ({ type }: AuthForm) => {
  const router = useRouter();
  const authFormSchema = formSchema(type);
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof authFormSchema>>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      name: "",
      password: "",
      email: "",
    },
  });

  const checkUserExists = async (email: string | undefined) => {
    const { data, error } = await supabaseBrowserClient
      .from("Users")
      .select("email")
      .eq("email", email)
      .limit(1)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking user:", error);
      return false;
    }

    return !!data;
  };

  const validatedFields = () => {
    const validated = authFormSchema.safeParse({
      name: form.getValues("name"),
      email: form.getValues("email"),
      password: form.getValues("password"),
    });
    if (!validated.success) {
      return false;
    } else return true;
  };

  const signUp = async (formData: z.infer<typeof authFormSchema>) => {
    setLoading(true);
    const isFieldValid = validatedFields();
    if (!isFieldValid) {
      toast.error("Ensure all fields are correctly filled");
      return;
    }
    const id = uuidv4();
    const userExist = await checkUserExists(formData?.email);
    if (!userExist) {
      try {
        const { data, error } = await supabaseBrowserClient.auth.signUp({
          email: formData?.email,
          password: formData?.password,
        });
        if (!error) {
          const { error: storageError } = await supabaseBrowserClient
            .from("Users")
            .insert([
              {
                _id: id,
                created_at: new Date().toISOString(),
                name: `${formData?.name}`,
                image_url: `---`,
                email: `${data?.user?.email}`,
                subscription: false,
                credits: 30,
              },
            ])
            .select();
          if (!storageError) {
            setLoading(false);
            toast.success(`Successfully signed up. Welcome ${formData?.name}`);
            router.replace("/dashboard");
          }
        } else {
          setLoading(false);
          toast.error(error?.message);
        }
      } catch (error) {
        setLoading(false);
        toast.error("An unexpected error occured.");
      }
    } else {
      setLoading(false);
      toast.error("An account already exists. Please sign in");
    }
  };

  const signIn = async (formData: z.infer<typeof authFormSchema>) => {
    setLoading(true);
    const isFieldValid = validatedFields();
    if (!isFieldValid) {
      toast.error("Ensure all fields are correctly filled");
      return;
    }
    const { data, error } = await supabaseBrowserClient.auth.signInWithPassword(
      {
        email: formData?.email,
        password: formData?.password,
      },
    );
    console.log(data, error, "data amd error");
    if (!error) {
      setLoading(false);
      toast.success(`Welcome`);
      router.replace("/dashboard");
    } else {
      setLoading(false);
      toast.error(error?.message || "Invalid Login Credentials");
    }
  };

  async function onSubmit(data: z.infer<typeof authFormSchema>) {
    try {
      if (type == "sign-in") {
        signIn(data);
      } else {
        signUp(data);
      }
    } catch (error) {
      console.log(error, "Error sign up or signing in");
      toast.error(`An unexpected error occured: ${error}`);
    }
  }

  const isSignIn = type === "sign-in";

  return (
    <SpotlightCard
      className="w-full h-full flex justify-between"
      spotlightColor="rgba(0, 229, 255, 0.2)"
    >
      <Card className="w-4/5 max-sm:w-1/2 flex h-full rounded-md">
        <CardHeader className="flex items-center flex-col">
          <CardTitle className="font-bold text-xl">
            {isSignIn ? "Sign In" : "Sign Up"}
          </CardTitle>
          <CardDescription>
            {isSignIn
              ? "Welcome back to PrepWise"
              : "Welcome to Prepsiwe, start your interview Journey"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              {!isSignIn && (
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-rhf-demo-title">
                        Name
                      </FieldLabel>
                      <Input
                        {...field}
                        id="form-rhf-demo-title"
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter your Firstname and Lastname"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              )}
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-title">Email</FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-demo-title"
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter email address"
                      autoComplete="off"
                      type={"email"}
                      className="rounded-sm"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-rhf-demo-description">
                      Password
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-password"
                      placeholder="Enter a secure password"
                      className="resize-none rounded-sm"
                      aria-invalid={fieldState.invalid}
                      type="password"
                    />

                    <FieldDescription>
                      Password should contain at least one lowercase, uppercase,
                      number and a special character
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="flex-col flex gap-2">
          <Field orientation="horizontal" className="flex-1 justify-center">
            <Button
              type="submit"
              form="form-rhf-demo"
              className="rounded-md flex w-4/5"
            >
              {loading && <Spinner data-icon="inline-start" />}
              {isSignIn ? "Sign In" : "Create Account"}
            </Button>
          </Field>
          <div className="flex gap-1">
            <h1>{isSignIn ? "No account yet?" : "Already have an account"}</h1>
            <Link href={isSignIn ? "/sign-up" : "/sign-in"}>
              <h1 className="font-semibold underline">
                {isSignIn ? "Sign Up" : "Sign In"}
              </h1>
            </Link>
          </div>
        </CardFooter>
      </Card>
      <Image
        src={"/logo.svg"}
        alt="company-logo"
        width={30}
        height={40}
        className="self-center w-1/5 ml-5"
      />
    </SpotlightCard>
  );
};

export default Authform;
