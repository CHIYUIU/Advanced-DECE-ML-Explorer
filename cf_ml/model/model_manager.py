import os
from abc import ABC, abstractmethod
import numpy as np
import pandas as pd

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader, TensorDataset
import torch.optim as optim

from cf_ml.utils import DirectoryManager

OUTPUT_ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'output')


class ModelManager(ABC):

    @abstractmethod
    def load_model(self):
        return

    @abstractmethod
    def forward(self, x):
        return

    @abstractmethod
    def evaluate(self):
        return

    @abstractmethod
    def save_model(self):
        return


class MLP(nn.Module):

    def __init__(self, feature_num, class_num, dropout=0.5):
        super(MLP, self).__init__()

        self.fc1 = nn.Linear(feature_num, 60)
        self.fc2 = nn.Linear(60, 30)
        self.fc3 = nn.Linear(30, class_num)

        self.dropout_layer = nn.Dropout(dropout)

    def forward(self, x):
        x = F.relu(self.fc1(x))
        x = self.dropout_layer(x)
        x = F.relu(self.fc2(x))
        x = self.dropout_layer(x)
        x = torch.sigmoid(self.fc3(x))
        return x


class LR(nn.Module):

    def __init__(self, feature_num, class_num):
        super(LR, self).__init__()

        self.fc = nn.Linear(feature_num, class_num)

    def forward(self, x):
        return F.sigmoid(self.fc(x))


class PytorchModelManager(ModelManager):
    """A class to store, train, evaluate, and apply a pytorch model.

    Args:
        dataset: dataset.Dataset, the target dataset.
        model_name: str, name of the model.
        root_dir: str, the path of the directory to store the model a