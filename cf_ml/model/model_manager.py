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
        root_dir: str, the path of the directory to store the model and relative information.
        model: a torch model or None, if model is none, a new MLP (#f, 60, 30, #c) will be created.
    """

    def __init__(self, dataset, model_name='MLP', root_dir=OUTPUT_ROOT, model=None):
        self._dataset = dataset
        self._name = model_name
        self._dir_manager = DirectoryManager(self._dataset, model_name, root=root_dir)

        self._features = self._dataset.dummy_features
        self._target = self._dataset.dummy_target
        self._prediction = "{}_pred".format(self._dataset.target)

        if model is None:
            self._model = MLP(feature_num=len(self._features),
                              class_num=len(self._target))
        else:
            self._model = model

        train_X = torch.from_numpy(
            self.dataset.get_train_X().values).float()
        train_y = torch.from_numpy(
            self.dataset.get_train_y().values).float()
        test_X = torch.from_numpy(
            self.dataset.get_test_X().values).float()
        test_y = torch.from_numpy(
            self.dataset.get_test_y().values).float()

        self.train_dataset = TensorDataset(train_X, train_y)
        self.test_dataset = TensorDataset(test_X, test_y)

        self._train_accuracy = None
        self._test_accuracy = None

    def load_model(self):
        """Load model states."""
        self._dir_manager.load_meta()
        self._model.load_state_dict(self._dir_manager.load_pytorch_model_state())

    def forward(self, x):
  