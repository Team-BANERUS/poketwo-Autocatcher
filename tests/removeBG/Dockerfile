FROM armswdev/armswdev/pytorch-arm-neoverse:r23.03-torch-1.13.0-onednn-acl

# Update and upgrade system packages
RUN apt-get update && apt-get -y upgrade

RUN apt-get install -y libsm6 libxext6 libxrender-dev ffmpeg
RUN pip install --upgrade pip
RUN pip install Pillow flask opencv-python-headless
RUN pip install --upgrade numpy==1.23.5

# Set the working directory
WORKDIR /app

# Copy the application code into the container
COPY ./ /app

CMD ["python", "main.py"]
