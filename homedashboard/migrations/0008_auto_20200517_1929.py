# Generated by Django 3.0.6 on 2020-05-17 19:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('homedashboard', '0007_auto_20200517_1711'),
    ]

    operations = [
        migrations.AlterField(
            model_name='home',
            name='rental_period',
            field=models.TextField(default='', null=True),
        ),
    ]
