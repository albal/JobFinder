// functions/search.js

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);

  // Add default parameters
  params.set('key', env.CV_LIBRARY_API_KEY);
  params.set('tempperm', 'Any'); // To get all job types

  // Force filters for fully remote and outside IR35 jobs
  const userQuery = params.get('q') || '';
  params.set('q', `${userQuery} "fully remote" "outside IR35"`);

  // Build the CV-Library API URL
  const apiUrl = `https://www.cv-library.co.uk/search-jobs-json?${params.toString()}`;

  try {
    // Make the request to the CV-Library API
    const response = await fetch(apiUrl);
    const results = await response.json();

    // Filter results for fully remote and outside IR35 roles
    const filteredJobs = results.jobs.filter(job => {
      const description = job.description ? job.description.toLowerCase() : '';
      const title = job.title ? job.title.toLowerCase() : '';
      return (
        description.includes('remote') ||
        title.includes('remote') ||
        description.includes('work from home') ||
        title.includes('work from home')
      );
    });

    // Return the filtered results
    const modifiedResults = {
      total_entries: filteredJobs.length,
      jobs: filteredJobs
    };

    return new Response(JSON.stringify(modifiedResults), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Adjust if needed
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return new Response(JSON.stringify({ error: 'An error occurred while fetching jobs.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Adjust if needed
      }
    });
  }
}
