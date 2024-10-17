'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useDebounceCallback } from 'usehooks-ts'

import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schemas/signUpSchema"
import axios, { AxiosError } from 'axios'
import { ApiResponse } from "@/types/apiResponse"
import { Loader2 } from "lucide-react"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"



function SignUpForm() {

  const [username, setUsername] = useState('')
  const [usernameMessage, setUsernameMessage] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const debounced = useDebounceCallback(setUsername, 300)
  const { toast } = useToast()
  const router = useRouter()

  //zod implimentation

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: ''
    }
  })

  useEffect(() => {

    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true)
        setUsernameMessage('')

        try {
          const response = await axios.get<ApiResponse>(`/api/check-username-unique?username=${username}`);

          // console.log('this is response', response);

          setUsernameMessage(response.data.message)
        } catch (err) {
          const axiosError = err as AxiosError<ApiResponse>
          setUsernameMessage(
            axiosError.response?.data.message ?? 'Error checking username'
          )
        } finally {
          setIsCheckingUsername(false)
        }
      }
    }
    checkUsernameUnique();

  }, [username])

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true)

    try {

      const response = await axios.post<ApiResponse>('/api/sign-up', data)
      toast({
        title: 'success',
        description: response.data.message
      })
      router.replace(`/verify/${username}`)
      setIsSubmitting(false)

    } catch (err) {
      console.error("Error in sign-up of user", err)
      const axiosError = err as AxiosError<ApiResponse>
      const errorMessage = axiosError.response?.data.message || "Error in sign-up of user";
      toast({
        title: 'Signup failed',
        description: errorMessage,
        variant: "destructive"
      })

      setIsSubmitting(false)

    } 
    // finally{
    //   setIsSubmitting(false)
    // }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join True Feedback
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel id="Username">Username</FormLabel>
                    <Input id="Username" placeholder="username"
                      {...field}
                      value={username}
                      onChange={(e) => {
                        field.onChange(e)
                        debounced(e.target.value)
                      }}
                    />
                  {isCheckingUsername && <Loader2 className="animate-spin" />}
                  {!isCheckingUsername && usernameMessage && (
                    <p
                      className={`text-sm ${
                        usernameMessage === 'Username is unique'
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {usernameMessage}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}

            />

            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel id="email">Email</FormLabel>
                    <Input id="email" placeholder="email"{...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel id="password">Password</FormLabel>
                    <Input id="password" type="password" placeholder="password"{...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {
                isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...
                  </>
                ) : ('Signup')
              }
            </Button>
          </form>
        </Form>

        <div className="text-center mt-4">
          <p>
            Already a member?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUpForm;