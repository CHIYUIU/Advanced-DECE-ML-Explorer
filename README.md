
## Advanced DECE: Decision Explorer with Counterfactual Explanations for ML Models

![teaser](./doc/teaser.png)

This repository, now managed by CHIYUIU, contains code and notebooks for the paper "*DECE: Decision Explorer with Counterfactual Explanations for Machine Learning Models*". Refer [here](https://ieeexplore.ieee.org/document/9229232) for the paper.

---
## Introduction

Counterfactual explanations allow humans to understand a model prediction by answering the question: How does one obtain an alternative or desirable prediction by altering the data just slightly? DECE serves as a visualization system aiding model developers and model users in exploring and understanding decisions made by machine learning models through counterfactual explanations.

This repository contains:

* DECE-engine, a swift & scalable implementation of the counterfactual explanation generation algorithm featured in the paper.
* DECE-visualization, a web-based interactive visualization system.

---

## Installation
### Development
Clone the repository from its original source or your forks:

    git clone https://github.com/CHIYUIU/Advanced-DECE-ML-Explorer.git

### Prepare for the Environment
Prepare for the Python environment:

    virtualenv venv/
    source venv/bin/activate
    pip install -r requirements.txt

Prepare for the Node.js environment:

    cd client/
    npm install

---
## Usage

### DECE-engine
Please refer to the [tutorial notebooks](./tutorials).

### DECE-visualization
To run the visualization aspect of the system, start a flask server and a web server as per the instructions below:

    python -m server.cli

    cd client/
    npm start

Visit `localhost:3000/` for the visualization.

## Cite this work
    @ARTICLE{9229232,
      author={Cheng, Furui and Ming, Yao and Qu, Huamin},
      journal={IEEE Transactions on Visualization and Computer Graphics}, 
      title={DECE: Decision Explorer with Counterfactual Explanations for Machine Learning Models}, 
      year={2021},
      volume={27},
      number={2},
      pages={1438-1447},
      doi={10.1109/TVCG.2020.3030342}}