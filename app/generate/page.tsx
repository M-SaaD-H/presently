"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function page() {
	const [url, setUrl] = useState("");
	const onSubmit = async () => {
		if (url === null || url === "") {
			alert("Please specify a url");
			return;
		}
		
		const res = await fetch("/api/generate", {
			method: "POST",
			headers: {
				"ContentType": "application/json"
			},
			body: JSON.stringify({
				url
			})
		})
	}

	return (
		<div>
			<section className="mt-48 mx-auto max-w-120">
				<h1 className="font-sans font-bold tracking-tight text-4xl text-center">
					Generate a Product Demo
				</h1>
				<div className="flex gap-2 mt-8">
					<Input
						placeholder="www.example.com"
						value={url}
						onChange={(e) => setUrl(e.target.value)}
					/>
					<Button onClick={onSubmit}>
						Generate Video
					</Button>
				</div>
			</section>
		</div>
	)
}
