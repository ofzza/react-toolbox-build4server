# react-toolbox-build4server

[![Build Status](https://travis-ci.org/ofzza/react-toolbox-build4server.svg?branch=master)](https://travis-ci.org/ofzza/react-toolbox-build4server)
[![npm version](https://badge.fury.io/js/react-toolbox-build4server.svg)](https://badge.fury.io/js/react-toolbox-build4server)

**react-toolbox-build4server** builds react-toolbox in such a way that it's components can be required and used in node - most likely for server-side rendered webapps - without having to depend on webpack to build your entire server-side project.

## When to use?

[**react-toolbox**](http://react-toolbox.com) is a material-design components library for React. One of the great things about it is that it uses CSS for it's styling which allows the user to fully customize the appearance of any of the components it provides.
However, the way the components' code uses CSS is a bit special (CSS modules directly required from JS code) and requires your project to be built with webpack which would do it's magic behind the scenes to make everything work.
 
All this is perfectly fine for your client-side web apps, but what if you wish to build an isomorphic application with server-side rendering and don't like the idea of packing up all of your server-side code into a single file?
 
This is where things can get pretty tricky and where **react-toolbox-build4server** module tries to help ...


## Dependencies

- Gulp

```
$ npm install -g gulp
```

## Install

```
$ npm install react-toolbox-build4server
```

Major and minor version of the **react-toolbox-build4server** module will match the version of [**react-toolbox**](http://react-toolbox.com) it is building.

## Example

Example project with server-side rendered react-toolbox components, using react-toolbox-build4server can be found [here](https://github.com/ofzza/react-toolbox-build4server-example).  

## Use pre-built react-toolbox components

After installing you can just import and use any of the components provided by [**react-toolbox**](http://react-toolbox.com). 

```javascript

import { Button, Input } from 'react-toolbox-build4server';
    
```

## Use as part of your own build process 

Module's internal ```gulpfile.js``` is written in such a way that it can be imported into your own ```gulpfile.js``` and used to define [**react-toolbox**](http://react-toolbox.com) build tasks for you.
To setup a [**react-toolbox**](http://react-toolbox.com) build task inside your own ```gulpfile.js``` you'll need to require and run **react-toolbox-build4server**'s ```gulpfile.js```, passing in following arguments:

 * A reference to your own instance of gulp 
 * A path of [**react-toolbox**](http://react-toolbox.com) module you want to build 
 * A target path the build task should output to 
 * _[Optional]_ An array of paths to .scss files you wish to prepend to [**react-toolbox**](http://react-toolbox.com) internal .scss files. This allow you to change any of the SASS variables used by any of the components.

```javascript

// Include gulp build task(s) from 'react-toolbox-build4server' module
require( path.join(__dirname, './node_modules/react-toolbox-build4server/gulpfile') )(      
  // Pass your gulp instalnce to create tasks with
  gulp,      
  // Pass location of your react-toolbox directory
  path.join(__dirname, './node_modules/react-toolbox'),
  // Pass target location for your build
  path.join(__dirname, './react-toolbox'),
  // Pass any additional .scss files you'd like to prepend to react-toolbox styles (probably SASS variables)
  [
    path.join(__dirname, './src/style/react-toolbox-config.scss')
  ]
);  
    
```

Now you can run a newly exposed ```gulp``` task to build [**react-toolbox**](http://react-toolbox.com) components by running:

```
$ gulp react-toolbox-build4server
```

## Styling

Your client-side application will need to include styles for the components it is using. 

If you're just using components directly from the **react-toolbox-build4server** module, ```style.css``` is located at:

```
./node_modules/react-toolbox-build4server/react-toolbox/style.css
```

If you're using **react-toolbox-build4server** as part of your own build process, ```style.css``` will be located at:

```
[build-target-path]/style.css
```

<br/>
---

# Build your own ...

## Internal structure

If your project has it's own build process, and you're including **react-toolbox-build4server** as part of it, it's target directory will contain [**react-toolbox**](http://react-toolbox.com) components in few different versions in different stages of being pre-build for you.
Depending on your project's build process, you can choose the one that fits you best ...

### Prebuilt JSX components

Standard way of including components from the **react-toolbox-build4server** module is in their fully pre-built form:

```javascript

import { Button, Input } from 'react-toolbox-build4server';
    
```

The code you're including here has already had ```require([scss file])``` calls from JS code handled and it's original ```ES6/JSX``` syntax transcompiled.
No further steps are needed for node to be able to execute the imported code. 

### Building JSX components yourself

For use-cases where your project's build procedure already has it's own ```ES6/JSX``` build step, you might want to include [**react-toolbox**](http://react-toolbox.com) components that are still in an ```ES6/JSX``` format and avoid re-building already built code.
In this case, you can include components as:

```javascript

import { Button, Input } from 'react-toolbox-build4server/react-toolbox/jsx';
    
```

If you decide to include components in this form, it is up to you to make sure they compile properly - all **react-toolbox-build4server** does for you in this case is handles ```require([scss file])``` calls from JS code.

### Prebuilt .css Styling

When including components' styling into your client-side application, you can simply include the pre-built ```style.css``` file. In this case, the file will use default style configuration and any changes you wish to make to the styling you'll need to do in a separate .css file with overriding rules for every single component that the change should apply to.

```css
*[data-react-toolbox="button"] {
    background-color: red;
}
```

### Building .scss Styling

Alternatively, you can have your own SASS build procedure into which you import .scss files from the **react-toolbox-build4server** module. Should you decide for this approach, you'll get the benefit of being able to reconfigure the styling.
You'll want to include **react-toolbox-build4server**'s ```style.scss``` file into your own SASS file, like this:

```css

@import "./node_modules/react-toolbox-build4server/react-toolbox/style.scss";

```

This ```style.scss``` file already imports ```style-config.scss``` file, which you might want to use as a templates for for your own configuration .scss file - just copy the file to your local project, modify any of the variables you need, and drop the "!default" sufix on the line you modified.
When you're done, just include your new custom configuration file before ```style.scss``` in your parent SASS file, like this:
   
```css

@import "./style-custom-config.scss";
@import "./node_modules/react-toolbox-build4server/react-toolbox/style.scss";

```

### License

MIT

