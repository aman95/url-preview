# URL Preview Generator

A tool developed in Node.js to generate preview of urls.

Easily deployable to AWS Lambda function.

*Request Format:*
> ?url=https://www.google.com

*Response format:*

	{
		"url": "https://www.google.com",
		"title": "Google",
		"description": "Let the matches begin! Celebrate ⚽ around the 🌎🌍🌏 in today's #GoogleDoodle!",
		"image": "https://www.google.com/logos/doodles/2018/world-cup-2018-day-9-5987135852118016.2-2xa.gif"
	}