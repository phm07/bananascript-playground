REGISTRY  := registry.pauhull.de
IMAGE     := bananascript-playground
TAG       := latest
PLATFORM  := linux/amd64
FULL_IMAGE := $(REGISTRY)/$(IMAGE):$(TAG)

.PHONY: all build push

all: build push

build:
	docker build --platform $(PLATFORM) -t $(FULL_IMAGE) .

push:
	docker push $(FULL_IMAGE)
