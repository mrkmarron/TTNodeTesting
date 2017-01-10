#!/usr/bin/python

import os, subprocess

script_path = os.path.dirname(os.path.realpath(__file__))
root_path = os.path.dirname(script_path)
ignore_list = ['.git', '.vscode']

def install_packages(current_path):
    cwd_path = os.getcwd()

    print("Installing packages for '%s'..." % os.path.basename(current_path))
    os.chdir(current_path)
    subprocess.call("npm install", shell=True)
    os.chdir(cwd_path)

    print("...done.")
    pass

def process_directory(current_path):
    package_path = os.path.join(current_path, "package.json")

    if os.path.exists(package_path):
        install_packages(current_path)
    else:
        directories = os.listdir(current_path)

        for item in directories:
            item_path = os.path.join(current_path, item)

            if not(os.path.isdir(item_path)):
                continue

            if item in ignore_list:
                continue

            process_directory(item_path)
    pass

process_directory(root_path)
