import yaml
import os
import git
import subprocess

YAML_FILE = "compressed.md"
FOLDERS = {
    "assets/images/backgrounds/":[1920,1600,1366,1024,768,640],
    "assets/images/content/":[1230,1024,874,655,655,560],
    "assets/images/":[] #Do not make any additional sizes
    }

#Link git with python
repo = git.Repo()
#Get the staged files
diffs = repo.index.diff('HEAD')
staged_files = [x.a_blob.path for x in diffs if hasattr(x, 'a_blob') and x.a_blob != None ]

#Directory of this file
dir = os.path.dirname(os.path.abspath(__file__))

#For each gallery directory, find all files and build the yaml.
for folder in FOLDERS.keys():

    #generate the path to the yaml file Jekyll will use
    folderpath = os.path.join(dir, folder)
    yamlfile = os.path.join(folderpath, YAML_FILE)

    #Generate a list of images the yaml file knows about
    #These images won't need compressing and resizing as they already are.
    knownimages = []
    if os.path.exists(yamlfile):
        stream = open(yamlfile, 'r')
        data = yaml.load_all(stream)
        knownimages = next(data)['images'] or []
        stream.close()

    #Generate a list of images that are there right now
    realimages = []
    for file in os.listdir(folderpath):
        if file.endswith(".jpg") or file.endswith(".jpeg"):
            realimages.append(file)
        elif file.endswith(".png"):
            realimages.append(file)

    #Some images may have been removed since the yaml was last updated
    #Let's remove those entries
    images = []

    #Now get the images that need compressing and adding to the yaml
    newimages = [img for img in realimages if img not in knownimages]

    #Compress the image and remember it
    for image in realimages:
        imagepath = os.path.join(folder, image)
        imagepathnoext = os.path.splitext(imagepath)[0]

        #Get the width of the image
        width = int(subprocess.check_output("identify -format \"%[w]\" " + imagepath, shell=True))

        #Compress, re-stage, and remember the images
        #We also want to create the smaller and larger sized resolutions
        if imagepath in staged_files:
            if image.endswith(".jpg") or image.endswith(".jpeg"):
                #Generate all of the resized versions
                for size in FOLDERS[folder]:
                    #If our image is say 800px wide, but we're asked to make it 1000px,
                    #obviously we're upsizing which is bad for storage space.
                    #If DONOTUPSIZE is set, we don't do that, simply using the original image
                    #Otherwise we upsize.
                    if DONOTUPSIZE and size > width:
                        #Just save the new file as an optimisation of the original
                        os.system("convert " + imagepath + " -sampling-factor 4:2:0 -strip -quality 85 -interlace JPEG -colorspace RGB " + imagepathnoext + "-" + size + ".jpg")
                    else:
                        os.system("convert " + imagepath + " -sampling-factor 4:2:0 -strip -resize " + size + "x -quality 85 -interlace JPEG -colorspace RGB " + imagepathnoext + "-" + size + ".jpg")
                    #Add the resized image
                    repo.git.add(imagepathnoext + "-" + size + ".jpg")
                #Optimise the original
                #os.system("convert " + imagepath + " -sampling-factor 4:2:0 -strip -quality 85 -interlace JPEG -colorspace RGB " + imagepath)
            elif image.endswith(".png"):
                #Optimise the original
                #os.system("optipng -quiet -o1 -strip all " + imagepath);

                #Generate all of the resized versions
                for size in FOLDERS[folder]:
                    #Convert the image
                    if size > width:
                        #Just save the new file as an copy of the original
                        os.system("cp " + imagepath + " " + imagepathnoext + "-" + size + ".png");
                    else:
                        #Make it smaller
                        os.system("convert " + imagepath + " -strip -resize " + size + "x " + imagepathnoext + "-" + size + ".png")
                        #Also optimise it
                        os.system("optipng -quiet -o1 -strip all " + imagepathnoext + "-" + size + ".png");
                    #Add the resized image
                    repo.git.add(imagepathnoext + "-" + size + ".png")
            #Add the optimised original image
            repo.git.add(imagepath)
            #Remember the images
            images.append(image)

    #Write the new yaml
    with open(yamlfile, 'w+') as outfile:
        outfile.write("---\n")
        yaml.dump({'images':images}, outfile, default_flow_style=False)
        outfile.write("---")
