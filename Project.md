# Neil Buzz Mike Forum

Welcome to the Neil Buzz Mike (NBM) Forum App! The goal with this application is to mimic the process our frontend developers follow when they’re working on real projects here at Moonward.

You’ll be closely following a Figma design made by one of our designers and implementing a set of backend APIs made by one of our backend developers.

## Getting Started

We realise that this kind of task can look incredibly daunting to begin with (especially given all the tech above which might be all new!) and thats okay! How do you eat an elephant? One bite at a time.

Below are a few steps to get you started and on the right path, both from a setup point of view and also a general guide for code structure, which should really help you organise when working on the scale of a larger project.

You can find the designs [here](https://www.figma.com/file/a1uOP2HfCIoMLY86fB3Uqy/NBM-Test?type=design&node-id=0-1&mode=design&t=obvIzESp5sk9ksvH-0)

You can find the APIs [here](https://api.development.forum.mike-automations.link/api)

### Step 1 - Project & Repo Setup

The first thing you should do is get your workspace sorted out, here’s a few things you’ll want to start with to make sure you’re setup for success:

1. Complete the [react native setup](https://www.notion.so/Developer-set-up-6c70828476eb40bdab27ba9bbee963b6?pvs=21) on your machine, the goal here should be to have a new react native project (created from the CLI, not expo) that you can run on a simulator. This can take a while to setup, and will require Xcode which is a pretty big download.
2. Setup your folder structure for the project. Below is an example which we would recommend following:

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/1dd56e07-1165-424d-9fda-7aff37dd57a1/79df71c5-d82d-4f55-94be-98bde426f93d/Untitled.png)

**Components**: Where you can setup your components, some people like to break this down into further sub folders and group components together.

**Constants**: Where you can hold some constant variables to be used throughout the app, may not be necessary in this app.

**Features**: You shouldn’t need this.

**Navigation**: Contains your stack navigators for RN navigation.

**Screens:** Contains your main screens (to be used in your navigators), think Pages in a web application

**Services**: Contains the service functions which call an external api. Normally these are grouped into files based on what the apis are for. For example in this app you might have a file named auth which contains api service functions like login and register, and a file name post which contains apis for creating, getting and editing posts. Typing the return value of these service functions is very important!

**Stores**: If you choose to use jotai or zustand your setup for your stores/atoms can go in here. Not necessary if you do not use those libraries.

**Types**: Here is where you should define your types for the application. Similarly to services you can group these types in multiple files based on what they’re for i.e. users, posts, comments etc.

**Utils**: Here you can define utility functions which are used multiple times throughout the app. A good example might be an axios instance, a debounce hook, a formatter or a math function. 

1. Setup a github repo and push your code to the main branch. There shouldn’t be any feature work in the main branch at this stage just a working stock standard react native application. For this project we will have many small deliverables which you will present in the form of several Pull Requests (PRs). When you work on a new feature you will need to create a branch for that feature, for example you might create a branch named feature/auth which contains the work for sign in and signup. Once you’re finished you can then create a PR into the main branch which can be reviewed by one of our senior devs. This is to get you used to the standard flow of new features and fixes in real applications, its really important to keep your git flow tidy!

## Step 2 - Auth

Now that you’re all setup its time to begin working on some features! For the first one we have outlined some instructions to help you get started and thinking on the right path in terms of components and api architecture. After auth you’ll be on your own to continue with the designs!

In 95% of applications the starting point is going to be user authentication and this app is no different. The reason for this is that a big majority of the apis you’ll need to use require the user to be authenticated to use, you can see which require authentication on the swagger documentation, indicated by a lock on the api:

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/1dd56e07-1165-424d-9fda-7aff37dd57a1/4d1e0cc9-f44d-4654-aae8-2fa7fdc3cb39/Untitled.png)

Firstly you’ll need to setup a navigation stack to put your actual sign in and sign up screens inside. Navigation stacks are react natives version of routing that you might be familiar with in react. You can find documentation on navigation stacks [here](https://reactnavigation.org/docs/stack-navigator/). 

You can think of your screens in a react native app just like routes in a react app (except you don’t have to deal with that pesky URL bar). Below are the designs for the authentication screens of the app (you can access these in the figma link above):

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/1dd56e07-1165-424d-9fda-7aff37dd57a1/ac4ef182-b141-4d38-b3a3-a5d8d070d89d/Untitled.png)

It’s always a good idea to plan exactly what should and shouldn’t be a screen. In reality there’s no wrong answer, its possible that every single rectangle above could be its own screen that you have to route to. However if you look into the above screens you’ll notice that we will likely need data from previous “screens” in the “screens” that come after.

It’s a good exercise to make a plan for how you would setup these screens in your repo, what files you would create etc. Have a think, but below would be the Moonward standard approach to a problem like this:

- **Show Answer**
    
    ```markdown
    ├── screens
    │   ├── splash.tsx
    │   ├── welcome.tsx
    │   ├── signin.tsx
    │   ├── signup.tsx
    ```
    
    You might be thinking, there are many screens above in the signup flow wouldn’t it make sense to create screens for each step? This can work, however at the final screen (upload a profile pic) in the signup flow we’ll be submitting our register api. This will require all the data from each previous screen, meaning each time we navigate away we would need to pass the data along with us, which is super messy and prone to errors.
    

I won’t give any instruction on the splash screen and the welcome screen as they’re fairly simple low function screens. For the login screen we can see a few components poking out at us already, namely:

1. An input
2. A button

The reason we would use components for these is because they are styled in a certain way, and if we look at the rest of the design we can see that style repeats. There will also be some common functionality we will write in for these components that will let us quickly reuse functionality throughout the app.

Lets start with the input. 

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/1dd56e07-1165-424d-9fda-7aff37dd57a1/768eabcb-252b-40ee-b644-7eee3dd467cf/Untitled.png)

Immediately we can notice a few things about these inputs that they will need:

1. An editable label
2. An editable placeholder
3. A value, and a way to change that value
4. Styling
5. The ability to have a password field, which can be toggled on and off with an icon button