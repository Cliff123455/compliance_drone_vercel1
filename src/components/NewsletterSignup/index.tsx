"use client";

import { useState } from "react";
import toast from "react-hot-toast";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/newsletter-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Welcome to the community! Check your email for details.");
        setEmail("");
      } else {
        toast.error(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          disabled={isLoading}
          className="flex-1 rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50"
        />
        <button 
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-white px-6 py-3 font-medium text-blue-600 transition-colors hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Joining..." : "Join Community"}
        </button>
      </div>
      <p className="mt-3 text-sm text-white/70">
        Get updates on solar inspections, drone technology, and pilot opportunities
      </p>
    </form>
  );
};

export default NewsletterSignup;