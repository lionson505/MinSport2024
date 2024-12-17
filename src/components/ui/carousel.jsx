import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "../../lib/utils";

const CarouselContext = React.createContext(null);

function Carousel({ children, ...props }) {
  const [emblaRef, emblaApi] = useEmblaCarousel();

  return (
    <CarouselContext.Provider value={{ emblaApi }}>
      <div ref={emblaRef} className="overflow-hidden" {...props}>
        <div className="flex">{children}</div>
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }) {
  return (
    <div className={cn("flex", className)} {...props} />
  );
}

function CarouselItem({ className, ...props }) {
  return (
    <div className={cn("min-w-0 flex-shrink-0 flex-grow-0", className)} {...props} />
  );
}

function CarouselPrevious() {
  const { emblaApi } = React.useContext(CarouselContext);

  return (
    <button
      onClick={() => emblaApi?.scrollPrev()}
      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center"
    >
      <ChevronLeft className="w-6 h-6" />
    </button>
  );
}

function CarouselNext() {
  const { emblaApi } = React.useContext(CarouselContext);

  return (
    <button
      onClick={() => emblaApi?.scrollNext()}
      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center"
    >
      <ChevronRight className="w-6 h-6" />
    </button>
  );
}

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext }; 