Kustomer.on("modal_show", () => console.log("modal_show"));
Kustomer.on("modal_hide", () => console.log("modal_hide"));
Kustomer.on("modal_close", () => console.log("modal_close"));

document.querySelectorAll(".profile-img").forEach((img) => {
    img.onerror = function () {
        // Check if a placeholder has already been applied to avoid infinite loops
        if (!this.dataset.fallback) {
            this.src = this.dataset.placeholder; // Replace with the placeholder image
            this.dataset.fallback = true; // Mark as having a fallback applied
        } else {
            this.style.display = "none"; // Hide the image if even the placeholder fails
        }
    };
});
async function createProfileCards(stakeholderData) {
    console.log(stakeholderData);

    // Get the scrollable container
    const scrollableContainer = document.querySelector(".scrollable-container");

    // Define the mapping for title and description based on fieldName
    const roleMapping = {
        csOwnerId: {
            title: "Customer Success Manager",
            description:
                "Plays a pivotal role in ensuring customers achieve their business goals using the Kustomer platform. They manage relationships post-sale, focusing on onboarding, product adoption, and successful renewals. Acting as trusted advisors, they collaborate across teams to deliver exceptional experiences and foster long-term partnerships.",
        },
        assignedTsePrimaryId: {
            title: "Premiere Support Engineer",
            description:
                "Assigned on an account-by-account basis by CX management, they ensure customers have a seamless experience with Kustomer. They bridge the gap between customers and the company, solving technical issues and providing guidance to maximize platform capabilities. They also diagnose and resolve problems, document knowledge, and maintain a strong focus on empathy and satisfaction.",
        },
        aeUserId: {
            title: "Account Executive",
            description:
                "Plays a critical role in driving growth by building relationships and closing deals with enterprise clients. They manage the full sales lifecycle, deliver product demonstrations, and consistently meet or exceed quotas. As thought leaders, they represent Kustomer at industry events to expand the company’s presence in the market.",
        },
        tamUserId: {
            title: "Technical Account Manager",
            description:
                "A key technical expert who works with customers to ensure success using the Kustomer platform. They collaborate with Customer Success Managers to drive adoption, resolve technical issues, and influence the product’s direction. Acting as advocates, they ensure the platform integrates seamlessly into customer workflows to create lasting value.",
        },
      imUserId: {
            title: "Technical Account Manager",
            description:
                "A key technical expert who works with customers to ensure success using the Kustomer platform. They collaborate with Customer Success Managers to drive adoption, resolve technical issues, and influence the product’s direction. Acting as advocates, they ensure the platform integrates seamlessly into customer workflows to create lasting value.",
        }
    };
  console.log(5353);
  console.log(roleMapping);

    for (const data of stakeholderData) {
        try {
            // Extract user data and role mapping
          console.log(55323333);
          console.log(data.data);
            const userData = data.data;
            const role = roleMapping[data.fieldName] || {
                title: "Unknown Role",
                description: "Description not available.",
            };

            // Create a new profile card
            const profileCard = document.createElement("div");
            profileCard.classList.add("profile-card");

            const imgContainer = document.createElement("div");
            imgContainer.classList.add("profile-img-container");

            if (userData.avatarUrl) {
                const img = document.createElement("img");
                img.classList.add("profile-img");
                img.src = userData.avatarUrl; // Use avatarUrl
                imgContainer.appendChild(img);
            } else {
                const svg = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "svg"
                );
                svg.setAttribute("width", "80");
                svg.setAttribute("height", "80");
                svg.setAttribute("viewBox", "0 0 24 24");
                svg.setAttribute("fill", "none");
                svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

                const path = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "path"
                );
                path.setAttribute("fill-rule", "evenodd");
                path.setAttribute("clip-rule", "evenodd");
                path.setAttribute(
                    "d",
                    "M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM15 10C15 11.6569 13.6569 13 12 13C10.3431 13 9 11.6569 9 10C9 8.34315 10.3431 7 12 7C13.6569 7 15 8.34315 15 10ZM17.5633 17.7488C16.6729 15.5506 14.5175 14 11.9999 14C9.48232 14 7.3269 15.5506 6.43652 17.7488C7.87626 19.1424 9.83793 20 11.9999 20C14.1619 20 16.1236 19.1424 17.5633 17.7488Z"
                );
                path.setAttribute("fill", "gray");

                // Add transform to scale and translate the path
                path.setAttribute("transform", "scale(1.2) translate(-2, -2)");

                svg.appendChild(path);
                imgContainer.appendChild(svg);
            }

            // Append the container to the DOM where necessary
            document.body.appendChild(imgContainer);

            // Create the details container
            const details = document.createElement("div");
            details.classList.add("profile-details");

            // Create the name element
            const name = document.createElement("h2");
            name.classList.add("name");
            name.id = "name";
            name.textContent = userData.displayName || "Unknown User";
            
            // Create the title and description
            const title = document.createElement("p");
            title.classList.add("title");
            title.textContent = role.title;

            const description = document.createElement("p");
            description.classList.add("description");
            description.textContent = role.description;

            // Append the elements to the details container
            details.appendChild(name);
            details.appendChild(title);
            details.appendChild(description);

            // Append the img and details to the profile card
            profileCard.appendChild(imgContainer);
            profileCard.appendChild(details);

            // Append the profile card to the scrollable container
            scrollableContainer.appendChild(profileCard);
        } catch (error) {
            console.error(`Error processing user data for ID: ${data.id}`, error);
        }
    }
}

function loadUserData(data) {
    createProfileCards(data.modalAdditionalData.stakeholderData);
}

Kustomer.on("modal_initialize", (stakeholderData) => {
    loadUserData(stakeholderData);
});


