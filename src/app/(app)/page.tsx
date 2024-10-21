"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import Autoplay from "embla-carousel-autoplay";

import carouselMessages from "@/data/messages.json";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Home = () => {
  const { data: session } = useSession();
  const router = useRouter();

  if (session) {
    router.replace("/dashboard");
  }

  return (
    <main className="flex flex-col flex-grow items-center justify-center px-4 md:px-24 py-12">
      <section className="text-center mb-8 md:mb-12">
        <h1 className=" text-2xl font-bold md:text-3xl">
          Stay Connected Anytime, Anywhere
        </h1>

        <p className="mt-3 md:mt-4 md:text-lg">
          Experience seamless communication with SimpleChat - Chat, share, and
          connect effortlessly with your friends and family.
        </p>
      </section>

      <Carousel
        className="w-full max-w-xs"
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[Autoplay({ delay: 2000 })]}
      >
        <CarouselContent>
          {carouselMessages.map((message, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardHeader className="text-center">
                    <h2 className="text-xl font-semibold">{message.title}</h2>
                  </CardHeader>

                  <CardContent className="flex justify-center text-lg">
                    <span className="text-center">{message.content}</span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </main>
  );
};

export default Home;
